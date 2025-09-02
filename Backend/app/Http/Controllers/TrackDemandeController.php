<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicDemandeTrackingResource;
use App\Models\Demande;
use App\Models\RequestType;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class TrackDemandeController extends Controller
{
    public function show(Request $request)
    {
        $data = $request->validate([
            'ref' => ['required', 'string', 'max:50'],
        ]);

        /** @var Demande|null $demande */
        $demande = Demande::query()
            ->with([
                'events',
                'author:id,name',
            ])
            ->where('ref', $data['ref'])
            ->first();

        if (!$demande) {
            return response()->json(['message' => 'Dossier non trouvé'], 404);
        }

        $type = RequestType::where('slug', $demande->type_slug)->first();
        $typeName = $type?->name ?? $demande->type_slug;
        $config   = (array) ($type?->config ?? []);

        $stepsDef = $this->workflowFor($demande->type_slug, $config);

        $steps = $this->projectSteps($stepsDef, $demande);

        $completed = collect($steps)->where('status', 'completed')->count();
        $progress  = (int) round(($completed / max(count($steps), 1)) * 100);
        if ($demande->status === 'termine') {
            $progress = 100;
        } elseif ($demande->status === 'annule') {
            $progress = 0;
        }

        $presetDaysMax = (int) Arr::get($demande->data, 'selected_preset.meta.delivery.max_days', 0);
        $slaDays       = (int) Arr::get($config, 'sla_days', 0);
        $eta = null;
        if ($demande->submitted_at) {
            if ($presetDaysMax > 0) {
                $eta = $demande->submitted_at->clone()->addDays($presetDaysMax)->toIso8601String();
            } elseif ($slaDays > 0) {
                $eta = $demande->submitted_at->clone()->addDays($slaDays)->toIso8601String();
            }
        }

        $clientHint = $this->maskName($demande->author?->name
            ?? (string) Arr::get($demande->data, 'name')
            ?? (string) Arr::get($demande->data, 'client')
            ?? '');

        return PublicDemandeTrackingResource::make((object)[
            'number'                => $demande->ref,
            'type'                  => $typeName,
            'status'                => $demande->status, // ex: recu | en-cours | ...
            'progress'              => $progress,
            'dates'                 => [
                'created_at'          => optional($demande->created_at)->toIso8601String(),
                'submitted_at'        => optional($demande->submitted_at)->toIso8601String(),
                'estimated_completion' => $eta,
            ],
            'client_hint'           => $clientHint,
            'steps'                 => $steps, //
        ]);
    }


    private function workflowFor(string $typeSlug, array $config): array
    {
        $cfg = Arr::get($config, 'workflow');
        if (is_array($cfg) && !empty($cfg)) {
            return array_values(array_map(fn($label) => [
                'key'   => \Str::slug((string)$label), // clé interne
                'name'  => (string)$label,             // label affiché
                'match' => [],                          // (optionnel) règles d’auto-complétion
            ], $cfg));
        }

        // Défaut par type
        return match ($typeSlug) {
            'creer-entreprise' => [
                ['key' => 'dossier-recu',         'name' => 'Dossier reçu',           'match' => [['event' => 'status_changed', 'payload.to' => 'recu']]],
                ['key' => 'docs-verifies',        'name' => 'Documents vérifiés',     'match' => [['event' => 'status_changed', 'payload.to' => 'en-cours']]],
                ['key' => 'redaction-statuts',    'name' => 'Rédaction des statuts',  'match' => [['event' => 'files_uploaded']]],
                ['key' => 'depot-greffe',         'name' => 'Dépôt au greffe',        'match' => [['event' => 'status_changed', 'payload.to' => 'en-attente-client']]],
                ['key' => 'immatriculation',      'name' => 'Immatriculation',        'match' => [['event' => 'status_changed', 'payload.to' => 'en-revision']]],
                ['key' => 'livraison-finale',     'name' => 'Livraison finale',       'match' => [['event' => 'status_changed', 'payload.to' => 'termine']]],
            ],
            default => [
                ['key' => 'dossier-recu',  'name' => 'Dossier reçu',       'match' => [['event' => 'status_changed', 'payload.to' => 'recu']]],
                ['key' => 'en-cours',      'name' => 'Traitement en cours', 'match' => [['event' => 'status_changed', 'payload.to' => 'en-cours']]],
                ['key' => 'validation',    'name' => 'Validation',          'match' => [['event' => 'status_changed', 'payload.to' => 'en-revision']]],
                ['key' => 'livraison',     'name' => 'Livraison',           'match' => [['event' => 'status_changed', 'payload.to' => 'termine']]],
            ],
        };
    }


    private function projectSteps(array $stepsDef, Demande $demande): array
    {
        $events = $demande->events; // déjà latest('id') sur relation


        $matchFn = function ($ev, $rule) {
            if (($ev->event ?? null) !== ($rule['event'] ?? null)) return false;
            if (isset($rule['payload.to'])) {
                return Arr::get($ev->payload, 'to') === $rule['payload.to'];
            }
            return true;
        };

        $completedIdx = -1;
        $result = [];

        foreach ($stepsDef as $i => $def) {
            $doneAt = null;

            foreach ($def['match'] as $rule) {
                $hit = $events->first(fn($ev) => $matchFn($ev, $rule));
                if ($hit) {
                    $doneAt = optional($hit->created_at)->toIso8601String();
                    break;
                }
            }

            if ($def['match'] === [] && $i === 0) {
                // Première étape sans règle explicite -> considérée "complétée" à submitted_at
                $doneAt = optional($demande->submitted_at)->toIso8601String();
            }

            $status = 'pending';
            if ($doneAt) {
                $status = 'completed';
                $completedIdx = $i;
            }

            $result[] = [
                'name'   => (string) $def['name'],
                'status' => $status,
                'date'   => $doneAt,
            ];
        }

        $firstPending = collect($result)->search(fn($s) => $s['status'] === 'pending');
        if ($firstPending !== false) {
            $result[$firstPending]['status'] = 'current';
        }

        if ($demande->status === 'termine') {
            $result = array_map(function ($s) {
                $s['status'] = 'completed';
                return $s;
            }, $result);
        }

        return $result;
    }

    private function maskName(?string $name): ?string
    {
        if (!$name) return null;
        $name = trim($name);
        $parts = preg_split('/\s+/', $name);
        $first = $parts[0] ?? '';
        $last  = $parts[1] ?? '';
        $firstMasked = mb_substr($first, 0, 1) . str_repeat('*', max(mb_strlen($first) - 1, 0));
        $lastMasked  = $last ? (mb_substr($last, 0, 1) . str_repeat('*', max(mb_strlen($last) - 1, 0))) : '';
        return trim($firstMasked . ' ' . $lastMasked);
    }
}
