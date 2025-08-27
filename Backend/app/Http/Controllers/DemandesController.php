<?php

namespace App\Http\Controllers;

use App\Http\Requests\DemandeStoreRequest;
use App\Http\Resources\DemandeResource;
use App\Models\Demande;
use App\Models\RequestType;
use Illuminate\Support\Facades\Storage;
use App\Models\DemandeFile;
use Illuminate\Http\Request;
use App\Models\DemandeMessage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\DemandeEvent;
use Illuminate\Support\Arr;
use App\Models\User;
use App\Models\EnterpriseType;
use App\Models\EnterpriseTypeOffer;



class DemandesController extends Controller
{

    public function index(Request $request)
    {
        $per = max(1, (int) $request->integer('per_page', 20));

        $q = Demande::query()
            ->with([
                'author:id,name,email',
                'assignee:id,name,email',
            ])
            ->latest('created_at');

        $q = $this->applyListFilters($request, $q);

        $pag = $q->paginate($per)->withQueryString();
        $slugs = $pag->getCollection()->pluck('type_slug')->filter()->unique()->values();

        $types = RequestType::whereIn('slug', $slugs)->get()->keyBy('slug');

        return response()->json([
            'data' => $pag->getCollection()->map(function ($d) use ($types) {
                $rt = $d->type_slug ? ($types[$d->type_slug] ?? null) : null;
                $typeName = $rt?->name;

                $service = $rt
                    ? Arr::except($rt->toArray(), [
                        'id',
                        'version',
                        'is_active',
                        'config',
                        'created_at',
                        'updated_at'
                    ])
                    : null;

                $clientName = optional($d->author)->name
                    ?? ($d->data['client'] ?? $d->data['client_nom'] ?? $d->data['nom'] ?? null);

                return [
                    'ref'          => $d->ref,

                    // On garde "type" léger
                    'type'         => $d->type_slug ? [
                        'slug' => $d->type_slug,
                        'name' => $typeName,
                    ] : null,

                    // On ajoute "service" avec toutes les infos utiles du RequestType
                    'service'      => $service,

                    'status'       => $d->status,
                    'priority'     => $d->priority,
                    'is_read'      => (bool) $d->is_read,
                    'currency'     => $d->currency,
                    'paid_status'  => $d->paid_status,
                    'paid_amount'  => $d->paid_amount,
                    'data'         => $d->data,

                    'meta'         => [
                        'type_name'   => $typeName,
                        'client_name' => $clientName,
                    ],

                    'submitted_at' => $d->submitted_at,
                    'created_at'   => $d->created_at,
                    'files'        => [],

                    'assignee'     => $d->assignee
                        ? ['id' => $d->assignee->id, 'name' => $d->assignee->name, 'email' => $d->assignee->email]
                        : null,

                    'author'       => $d->author
                        ? ['id' => $d->author->id, 'name' => $d->author->name, 'email' => $d->author->email]
                        : null,
                ];
            })->values(),

            'links' => [
                'first' => $pag->url(1),
                'last'  => $pag->url($pag->lastPage()),
                'prev'  => $pag->previousPageUrl(),
                'next'  => $pag->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $pag->currentPage(),
                'from'         => $pag->firstItem(),
                'last_page'    => $pag->lastPage(),
                'links'        => $pag->linkCollection(),
                'path'         => $pag->path(),
                'per_page'     => $pag->perPage(),
                'to'           => $pag->lastItem(),
                'total'        => $pag->total(),
            ],
        ]);
    }

    public function store(\App\Http\Requests\DemandeStoreRequest $r): \Illuminate\Http\JsonResponse
    {
        $typeSlug = (string) $r->input('type');
        $rt = \App\Models\RequestType::where('slug', $typeSlug)->firstOrFail();
        if (!$rt->is_active) abort(422, 'Type désactivé');

        $variantKey = (string) $r->input('variant_key', '');
        $data = (array) $r->input('data', []);
        $first = (string) data_get($data, 'firstName', '');
        $last  = (string) data_get($data, 'lastName', '');
        $nameFromForm = trim($first . ' ' . $last);

        // --------- Gestion COMPTE (inchangé)
        $user = $r->user();
        if ($user) {
            $changed = false;
            if ($nameFromForm && $nameFromForm !== $user->name) {
                $user->name = $nameFromForm;
                $changed = true;
            }
            foreach (['phone', 'address', 'profession', 'nationality'] as $f) {
                $val = (string) data_get($data, $f, '');
                if ($val !== '' && $val !== (string) ($user->{$f} ?? '')) {
                    $user->{$f} = $val;
                    $changed = true;
                }
            }
            if ($changed) $user->save();
        } else {
            $email = (string) data_get($data, 'email');
            if ($email) {
                $user = \App\Models\User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name'        => $nameFromForm ?: $email,
                        'phone'       => (string) data_get($data, 'phone', '') ?: null,
                        'address'     => (string) data_get($data, 'address', '') ?: null,
                        'profession'  => (string) data_get($data, 'profession', '') ?: null,
                        'nationality' => (string) data_get($data, 'nationality', '') ?: null,
                        'password'    => bcrypt(\Illuminate\Support\Str::password(16)),
                    ]
                );
                $dirty = false;
                foreach (['phone', 'address', 'profession', 'nationality'] as $f) {
                    $val = (string) data_get($data, $f, '');
                    if ($val && empty($user->{$f})) {
                        $user->{$f} = $val;
                        $dirty = true;
                    }
                }
                if ($nameFromForm && $user->name !== $nameFromForm) {
                    $user->name = $nameFromForm;
                    $dirty = true;
                }
                if ($dirty) $user->save();
            }
        }

        // --------- Spécifique "creer-entreprise" (ajout minimal, n'impacte pas les autres types)
        if ($rt->slug === 'creer-entreprise') {
            if (!$variantKey) {
                return response()->json([
                    'message' => 'The variant key field is required.',
                    'errors'  => ['variant_key' => ['The variant key field is required.']],
                ], 422);
            }


            $raw = preg_replace('/\s+/', '', (string) $variantKey);
            $parts = preg_split('/(::|:|\||\.|\/)/', $raw);

            // Si "SIGLE:offer_key", on garde tel quel.
            // Si on a seulement "offer_key", on prend le sigle depuis data.enterprise_type_sigle.
            $offerKey = (string) ($parts[1] ?? $parts[0] ?? '');
            $sigle    = strtoupper((string) ($parts[1] ? $parts[0] : data_get($data, 'enterprise_type_sigle', '')));

            if ($sigle === '' || $offerKey === '') {
                return response()->json([
                    'message' => 'Variante invalide pour ce type.',
                    'errors'  => ['variant_key' => ['Variante invalide pour ce type.']],
                ], 422);
            }

            $etype = EnterpriseType::where('sigle', $sigle)->first();
            if (!$etype) {
                return response()->json([
                    'message' => 'Type d’entreprise inconnu.',
                    'errors'  => ['variant_key' => ['Type d’entreprise inconnu.']],
                ], 422);
            }

            $offer = EnterpriseTypeOffer::where('enterprise_type_id', $etype->id)
                ->where('key', $offerKey)
                ->where('is_active', true)
                ->first();

            if (!$offer) {
                return response()->json([
                    'message' => 'Variante invalide pour ce type.',
                    'errors'  => ['variant_key' => ['Variante invalide pour ce type.']],
                ], 422);
            }

            // Zone tarifaire fournie par le formulaire (par ex. "abidjan" / "interieur")
            $zoneInput = strtolower((string) (
                data_get($data, 'zone_tarif') ??
                data_get($data, 'zone') ??
                data_get($data, 'localisation') ??
                data_get($data, 'creationLocation') ??
                data_get($data, 'lieu_creation') ??
                'abidjan'
            ));

            $isAbj = str_contains($zoneInput, 'abidjan') || str_contains($zoneInput, 'abj');

            $pricingMode = (string) $offer->pricing_mode; // fixed | from | quote
            $currency    = (string) ($offer->currency ?: 'XOF');

            $amountFixed = null;
            $priceDisplay = 'Sur devis';

            if ($pricingMode === 'fixed') {
                $amountFixed = $isAbj
                    ? $offer->price_amount_abidjan
                    : $offer->price_amount_interior;

                if (is_numeric($amountFixed)) {
                    $priceDisplay = number_format((float)$amountFixed, 0, ',', ' ') . ' ' . $currency;
                } else {
                    // si pas de montant défini, on bascule sur "Sur devis"
                    $pricingMode = 'quote';
                    $priceDisplay = 'Sur devis';
                }
            } elseif ($pricingMode === 'from') {
                // "À partir de" = on prend le plus petit prix non null/numérique
                $candidates = array_values(array_filter([
                    is_numeric($offer->price_amount_abidjan) ? (float)$offer->price_amount_abidjan : null,
                    is_numeric($offer->price_amount_interior) ? (float)$offer->price_amount_interior : null,
                ], fn($v) => $v !== null));

                if (!empty($candidates)) {
                    $min = min($candidates);
                    $priceDisplay = 'À partir de ' . number_format($min, 0, ',', ' ') . ' ' . $currency;
                } else {
                    $priceDisplay = 'À partir de —';
                }
            } else {
                // quote
                $priceDisplay = 'Sur devis';
            }

            // Normalise le variant_key stocké
            $variantKey = $etype->sigle . ':' . $offer->key;

            // Pousse un bloc selected_preset homogène dans $data (exigé côté front)
            $data['selected_preset'] = [
                'label'         => $etype->sigle . ' — ' . ($offer->title ?: $offer->key),
                'price'         => is_numeric($amountFixed) ? (float)$amountFixed : null,
                'price_display' => $priceDisplay,
                'pricing_mode'  => $pricingMode,
                'currency'      => $currency,
                'variant_key'   => $variantKey,
                'meta'          => [
                    'sigle'      => $etype->sigle,
                    'offer_key'  => $offer->key,
                    'zone'       => $isAbj ? 'abidjan' : 'interieur',
                    'subtitle'   => $offer->subtitle,
                    'pill'       => $offer->pill,
                    'delivery'   => [
                        'min_days' => $offer->delivery_min_days,
                        'max_days' => $offer->delivery_max_days,
                    ],
                ],
            ];
        }

        // --- meta (inchangé)
        $meta = [
            'ip'        => $r->ip(),
            'ua'        => $r->userAgent(),
            'type_name' => $rt->name,
        ];
        if (is_array(data_get($data, 'selected_preset'))) {
            $meta['selected_preset'] = data_get($data, 'selected_preset');
        }

        // --- creation (inchangé, on garde currency du RequestType)
        $demande = \App\Models\Demande::create([
            'type_slug'    => $typeSlug,
            'type_version' => (int) ($rt->version ?? 1),
            'variant_key'  => $variantKey ?: null,
            'status'       => 'recu',
            'priority'     => $r->boolean('urgent') ? 'urgent' : 'normal',
            'is_read'      => false,
            'created_by'   => optional($user)->id,
            'currency'     => $rt->currency ?? 'XOF',
            'paid_status'  => 'unpaid',
            'paid_amount'  => null,
            'data'         => $data,
            'meta'         => $meta,
            'submitted_at' => now(),
        ]);

        // --- upload fichiers (inchangé)
        if ($r->hasFile('files')) {
            foreach ($r->file('files') as $tag => $fileOrList) {
                $files = is_array($fileOrList) ? $fileOrList : [$fileOrList];
                foreach ($files as $f) {
                    $path = $f->store("demandes/{$demande->ref}", 'public');
                    \App\Models\DemandeFile::create([
                        'demande_id'    => $demande->id,
                        'tag'           => $tag,
                        'original_name' => $f->getClientOriginalName(),
                        'path'          => $path,
                        'mime'          => $f->getClientMimeType(),
                        'size'          => $f->getSize(),
                        'uploaded_by'   => optional($user)->id,
                    ]);
                }
            }
        } elseif ($r->hasFile('files.attachments')) {
            foreach ($r->file('files.attachments') as $f) {
                $path = $f->store("demandes/{$demande->ref}", 'public');
                \App\Models\DemandeFile::create([
                    'demande_id'    => $demande->id,
                    'tag'           => 'attachments',
                    'original_name' => $f->getClientOriginalName(),
                    'path'          => $path,
                    'mime'          => $f->getClientMimeType(),
                    'size'          => $f->getSize(),
                    'uploaded_by'   => optional($user)->id,
                ]);
            }
        }

        return response()->json([
            'demande'      => \App\Http\Resources\DemandeResource::make($demande->fresh()),
            'updated_user' => $user ? [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'phone'       => $user->phone,
                'address'     => $user->address,
                'profession'  => $user->profession,
                'nationality' => $user->nationality,
            ] : null,
        ]);
    }


    public function show(Demande $demande)
    {
        $demande->load([
            'files',
            'messages.sender:id,name',
            'assignee:id,name,email',
            'author:id,name,email',
            'events',
        ]);

        $typeName = \App\Models\RequestType::where('slug', $demande->type_slug)->value('name') ?? $demande->type_slug;
        $demande->meta = array_merge($demande->meta ?? [], ['type_name' => $typeName]);

        return \App\Http\Resources\DemandeResource::make($demande);
    }

    // Lu/non-lu
    public function markRead(Demande $demande)
    {
        $demande->update(['is_read' => true]);
        return response()->json(['ok' => true]);
    }
    public function markUnread(Demande $demande)
    {
        $demande->update(['is_read' => false]);
        return response()->json(['ok' => true]);
    }

    public function assign(Request $request, \App\Models\Demande $demande)
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $demande->assigned_to = $data['user_id'];
        $demande->save();

        $demande->events()->create([
            'event'    => 'assigned',
            'payload'  => ['user_id' => $data['user_id']],
            'actor_id' => optional($request->user())->id,
            'actor_name' => optional($request->user())->name,
        ]);

        $demande->load('assignee:id,name,email');

        return response()->json([
            'message'  => 'assigned',
            'assignee' => $demande->assignee
                ? ['id' => $demande->assignee->id, 'name' => $demande->assignee->name, 'email' => $demande->assignee->email]
                : null,
        ]);
    }


    public function postMessage(Request $r, Demande $demande)
    {
        $data = $r->validate([
            'body' => ['required', 'string', 'max:5000'],
            'is_internal' => ['sometimes', 'boolean'],
        ]);

        \App\Models\DemandeMessage::create([
            'demande_id'  => $demande->id,
            'sender_id'   => optional($r->user())->id,
            'sender_role' => 'staff',
            'is_internal' => (bool)($data['is_internal'] ?? false),
            'body'        => $data['body'],
        ]);

        DemandeEvent::create([
            'demande_id' => $demande->id,
            'event'      => 'message_posted',
            'payload'    => ['is_internal' => (bool)($data['is_internal'] ?? false)],
            'actor_id'   => optional($r->user())->id,
            'actor_name' => optional($r->user())->name,
        ]);

        return response()->json(['ok' => true]);
    }

    public function uploadFiles(Request $r, Demande $demande)
    {
        $r->validate(['files' => ['required', 'array']]);
        $count = 0;
        $tags = [];

        foreach ($r->file('files', []) as $tag => $fileOrList) {
            $files = is_array($fileOrList) ? $fileOrList : [$fileOrList];
            $tags[] = $tag;
            foreach ($files as $f) {
                $path = $f->store("demandes/{$demande->ref}");
                \App\Models\DemandeFile::create([
                    'demande_id'    => $demande->id,
                    'tag'           => $tag,
                    'original_name' => $f->getClientOriginalName(),
                    'path'          => $path,
                    'mime'          => $f->getClientMimeType(),
                    'size'          => $f->getSize(),
                    'uploaded_by'   => optional($r->user())->id,
                ]);
                $count++;
            }
        }

        \App\Models\DemandeEvent::create([
            'demande_id' => $demande->id,
            'event'      => 'files_uploaded',
            'payload'    => ['count' => $count, 'tags' => $tags],
            'actor_id'   => optional($r->user())->id,
            'actor_name' => optional($r->user())->name,
        ]);

        return response()->json(['ok' => true]);
    }


    public function viewFile(Demande $demande, DemandeFile $file)
    {
        abort_unless($file->demande_id === $demande->id, 404);
        $disk = \Illuminate\Support\Facades\Storage::disk('public');

        if (!$disk->exists($file->path)) {
            abort(404, 'Fichier introuvable');
        }

        $absolutePath = $disk->path($file->path);
        $mime = $file->mime ?: 'application/octet-stream';
        $filename = $file->original_name ?: basename($file->path);

        return response()->file($absolutePath, [
            'Content-Type'        => $mime,
            'Content-Disposition' => 'inline; filename="' . addslashes($filename) . '"',
            'X-Accel-Buffering'   => 'no',
        ]);
    }



    public function unreadCount(Request $r)
    {
        $q = Demande::query()->where('is_read', false);
        if ($r->filled('type'))       $q->where('type_slug', $r->string('type'));
        if ($r->filled('assigned_to')) $q->where('assigned_to', $r->integer('assigned_to'));
        if ($r->filled('priority'))   $q->where('priority', $r->string('priority'));
        if ($r->filled('status'))     $q->where('status', $r->string('status'));

        return response()->json(['unread' => (int) $q->count()]);
    }

    private function applyListFilters(Request $r, $q)
    {
        if ($r->filled('type'))       $q->where('type_slug', $r->string('type'));
        if ($r->filled('status'))     $q->where('status', $r->string('status'));
        if ($r->filled('priority'))   $q->where('priority', $r->string('priority'));
        if ($r->filled('assigned_to')) $q->where('assigned_to', $r->integer('assigned_to'));
        if ($r->filled('unread'))     $q->where('is_read', filter_var($r->input('unread'), FILTER_VALIDATE_BOOLEAN));
        if ($r->filled('date_from'))  $q->whereDate('created_at', '>=', $r->date('date_from'));
        if ($r->filled('date_to'))    $q->whereDate('created_at', '<=', $r->date('date_to'));

        if ($s = trim((string)$r->input('q'))) {
            $q->where(function ($qq) use ($s) {
                $qq->where('ref', 'like', "%{$s}%")
                    ->orWhere('type_slug', 'like', "%{$s}%")
                    // ajoute si utile: recherche dans les champs métier fréquents
                    ->orWhere('data->poste', 'like', "%{$s}%");
            });
        }
        return $q;
    }

    public function exportCsv(Request $r): StreamedResponse
    {
        $q = $this->applyListFilters($r, Demande::query()->with(['assignee:id,name', 'author:id,name'])->latest('id'));

        // map slug -> libellé
        $typeMap = RequestType::pluck('name', 'slug')->all();

        $filename = 'demandes-' . now()->format('Ymd-His') . '.csv';
        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'no-store, no-cache',
        ];

        return response()->stream(function () use ($q, $typeMap) {
            $out = fopen('php://output', 'w');
            // BOM UTF-8 pour Excel
            fwrite($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($out, ['Ref', 'Client', 'Type', 'Statut', 'Urgence', 'Assigné à', 'Créée le']);

            $q->chunk(500, function ($rows) use ($out, $typeMap) {
                foreach ($rows as $d) {
                    $client   = $d->author->name ?? ($d->data['clientNom'] ?? '-');
                    $typeName = $typeMap[$d->type_slug] ?? $d->type_slug;
                    $assignee = $d->assignee->name ?? '-';
                    $date     = optional($d->created_at)->format('Y-m-d H:i');

                    fputcsv($out, [
                        $d->ref,
                        $client,
                        $typeName,
                        $d->status,
                        $d->priority,
                        $assignee,
                        $date,
                    ]);
                }
            });

            fclose($out);
        }, 200, $headers);
    }

    public function changeStatus(Request $r, Demande $demande)
    {
        $allowed = ['recu', 'en-cours', 'en-attente-client', 'en-revision', 'termine', 'annule'];
        $data = $r->validate([
            'status' => ['required', 'string', 'in:' . implode(',', $allowed)],
            'note' => ['sometimes', 'string', 'max:1000']
        ]);

        $demande->status = $data['status'];
        $demande->save();

        DemandeEvent::create([
            'demande_id' => $demande->id,
            'event'      => 'status_changed',
            'payload'    => ['to' => $data['status'], 'note' => $data['note'] ?? null],
            'actor_id'   => optional($r->user())->id,
            'actor_name' => optional($r->user())->name,
        ]);

        return response()->json(['ok' => true]);
    }

    public function setPriority(Request $r, Demande $demande)
    {
        $data = $r->validate([
            'priority' => ['required', 'in:urgent,normal'],
        ]);

        $demande->priority = $data['priority'];
        $demande->save();

        \App\Models\DemandeEvent::create([
            'demande_id' => $demande->id,
            'event'      => 'priority_changed',
            'payload'    => ['priority' => $data['priority']],
            'actor_id'   => optional($r->user())->id,
            'actor_name' => optional($r->user())->name,
        ]);

        return response()->json(['ok' => true, 'priority' => $demande->priority]);
    }
}
