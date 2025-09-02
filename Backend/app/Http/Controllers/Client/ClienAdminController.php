<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Arr;
use App\Models\Demande;
use App\Models\DemandeFile;
use App\Models\DemandeEvent;
use Illuminate\Support\Facades\DB;
use App\Models\Registration;
use App\Models\Formation;
use App\Models\DemandeMessage;



class ClienAdminController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        abort_if(!$user, 401, 'Unauthenticated');

        $limitDemandes      = (int) $request->integer('limit_demandes')      ?: 5;
        $limitDocuments     = (int) $request->integer('limit_documents')     ?: 5;
        $limitNotifications = (int) $request->integer('limit_notifications') ?: 50;

        $EN_COURS = ['recu', 'en_cours', 'en_attente_client', 'en_revision'];
        $PRETES   = ['pret'];

        $demandesBase = Demande::query()->where('created_by', $user->id);

        // --- STATS
        $demandesEnCours = (clone $demandesBase)->whereIn('status', $EN_COURS)->count();
        $demandesPretes  = (clone $demandesBase)->whereIn('status', $PRETES)->count();

        // Notifications = DemandeEvent (pas de suivi read/unread ici)
        // On renvoie les X derniers events + on met le compteur = nombre renvoyé
        $demandeIds = (clone $demandesBase)->pluck('id');

        // --- RECENT DEMANDES (tri par submitted_at DESC)
        $recentDemandes = (clone $demandesBase)
            ->orderByDesc('submitted_at')
            ->limit($limitDemandes)
            ->get()
            ->map(function (Demande $d) {
                $typeName = Arr::get($d->meta ?? [], 'type_name', $d->type_slug);
                $selectedPreset = Arr::get($d->data ?? [], 'selected_preset');
                return [
                    'ref'          => $d->ref,
                    'type'         => [
                        'slug'    => $d->type_slug,
                        'version' => (int) $d->type_version,
                        'name'    => $typeName,
                    ],
                    'status'       => $d->status,
                    'priority'     => $d->priority,
                    'paid_status'  => $d->paid_status,
                    'paid_amount'  => $d->paid_amount,
                    'submitted_at' => optional($d->submitted_at)->toISOString(),
                    'progress'     => Arr::get($d->data ?? [], 'progress'), // si tu l’alimentes
                    'selected_preset' => $selectedPreset ?: null,
                ];
            })
            ->values();

        // --- RECENT DOCUMENTS (via join avec demandes pour sécuriser l’appartenance au client)
        $recentDocuments = DemandeFile::query()
            ->select([
                'demande_files.id',
                'demande_files.tag',
                'demande_files.original_name',
                'demande_files.path',
                'demande_files.mime',
                'demande_files.size',
                'demande_files.created_at',
                'demandes.ref as demande_ref',
            ])
            ->join('demandes', 'demandes.id', '=', 'demande_files.demande_id')
            ->where('demandes.created_by', $user->id)
            ->orderByDesc('demande_files.created_at')
            ->limit($limitDocuments)
            ->get()
            ->map(function ($f) {
                return [
                    'id'            => $f->id,
                    'demande_ref'   => $f->demande_ref,
                    'tag'           => $f->tag,
                    'original_name' => $f->original_name,
                    'path'          => "storage/" . $f->path, // le front fera getFileUrl(path)
                    'mime'          => $f->mime,
                    'size'          => (int) $f->size,
                    'created_at'    => optional($f->created_at)->toISOString(),
                ];
            })
            ->values();

        // --- RECENT NOTIFICATIONS = derniers DemandeEvent des demandes du client
        $recentNotifications = DemandeEvent::query()
            ->select([
                'demande_events.id',
                'demande_events.event',
                'demande_events.actor_name',
                'demande_events.payload',
                'demande_events.created_at',
                'demandes.ref as demande_ref',
            ])
            ->join('demandes', 'demandes.id', '=', 'demande_events.demande_id')
            ->whereIn('demande_events.demande_id', $demandeIds)
            ->orderByDesc('demande_events.created_at')
            ->limit($limitNotifications)
            ->get()
            ->map(function ($e) {
                return [
                    'id'          => $e->id,
                    'demande_ref' => $e->demande_ref,
                    'event'       => $e->event,
                    'actor_name'  => $e->actor_name,
                    'payload'     => is_array($e->payload) ? $e->payload : (json_decode($e->payload ?? '[]', true) ?: null),
                    'created_at'  => optional($e->created_at)->toISOString(),
                    'read_at'     => null,
                ];
            })
            ->values();

        $notificationsCount = $recentNotifications->count();

        return response()->json([
            'stats' => [
                'demandes_en_cours'       => $demandesEnCours,
                'demandes_pretes'         => $demandesPretes,
                'notifications_non_lues'  => $notificationsCount,
            ],
            'recent_demandes'     => $recentDemandes,
            'recent_documents'    => $recentDocuments,
            'recent_notifications' => $recentNotifications,
            'meta' => [
                'filters' => [
                    'status_groups' => [
                        'EN_COURS' => $EN_COURS,
                        'PRETES'   => $PRETES,
                    ],
                    'limits' => [
                        'demandes'      => $limitDemandes,
                        'documents'     => $limitDocuments,
                        'notifications' => $limitNotifications,
                    ],
                ],
                'generated_at' => now()->toISOString(),
            ],
        ]);
    }

    public function orders(Request $request)
    {
        $user = Auth::user();
        abort_if(!$user, 401, 'Unauthenticated');

        $perPage = max(1, (int) $request->integer('per_page') ?: 10);
        $page    = max(1, (int) $request->integer('page') ?: 1);

        $demandesSql = DB::table('demandes')
            ->selectRaw("
                'demande' as kind,
                demandes.ref as ref,
                demandes.type_slug as title,           -- libellé humain sera donné via meta.type_name plus bas
                demandes.status as status_code,
                demandes.priority,
                demandes.paid_status,
                demandes.submitted_at as ordered_at,
                demandes.created_at,
                demandes.id as model_id,
                null as extra_json
            ")
            ->where('created_by', $user->id);

        $registrationsSql = DB::table('registrations')
            ->join('formations', 'formations.id', '=', 'registrations.formation_id')
            ->selectRaw("
                'formation' as kind,
                formations.code as ref,
                formations.title as title,
                registrations.status as status_code,
                'normal' as priority,
                case when registrations.status = 'paid' then 'paid' else 'unpaid' end as paid_status,
                registrations.created_at as ordered_at,
                registrations.created_at,
                registrations.id as model_id,
                json_object(
                    'formation_code', formations.code,
                    'formation_title', formations.title,
                    'amount_cfa', coalesce(registrations.amount_cfa, formations.price_cfa),
                    'date', formations.date
                ) as extra_json
            ")
            ->where('registrations.user_id', $user->id);

        $union = $demandesSql->unionAll($registrationsSql);

        $rows = DB::query()
            ->fromSub($union, 't')
            ->orderByDesc('ordered_at')
            ->orderByDesc('created_at')
            ->get();

        $total = $rows->count();
        $items = $rows->slice(($page - 1) * $perPage, $perPage)->values();

        $statusProgress = [
            'recu'              => 10,
            'en_cours'          => 50,
            'en_attente_client' => 30,
            'en_revision'       => 75,
            'pret'              => 100,
            'termine'           => 100,
            'annule'            => 100,
        ];

        $statusLabel = [
            'recu'              => 'Reçu',
            'en_cours'          => 'En cours',
            'en_attente_client' => 'En attente client',
            'en_revision'       => 'En révision',
            'pret'              => 'Terminé',
            'termine'           => 'Terminé',
            'annule'            => 'Annulé',
            'paid'              => 'Payé',
            'pending'           => 'En attente',
        ];

        // Pour récupérer meta.type_name pour demandes (label service humain)
        $demandeMeta = DB::table('demandes')
            ->whereIn('ref', $items->where('kind', 'demande')->pluck('ref')->all())
            ->pluck('meta', 'ref');

        $items = $items->map(function ($r) use ($statusLabel, $statusProgress, $demandeMeta) {
            $kind = $r->kind;

            $title = $r->title;
            if ($kind === 'demande') {
                $meta = json_decode($demandeMeta[$r->ref] ?? '{}', true);
                $typeName = Arr::get($meta, 'type_name');
                if ($typeName) $title = $typeName;
            } else {
                //
            }

            $code = strtolower((string)$r->status_code);
            $label = $statusLabel[$code] ?? ucfirst($code);
            $progress = $statusProgress[$code] ?? ($code === 'paid' ? 100 : 0);

            return [
                'kind'         => $kind,
                'ref'          => $r->ref,
                'title'        => $title,
                'status'       => $code,
                'status_label' => $label,
                'progress'     => $progress,
                'paid_status'  => $r->paid_status,
                'ordered_at'   => optional($r->ordered_at)->toISOString(),
                'model_id'     => (int) $r->model_id,
                'extra'        => $r->extra_json ? json_decode($r->extra_json, true) : null,
            ];
        });

        return response()->json([
            'data' => $items,
            'pagination' => [
                'total'        => $total,
                'per_page'     => $perPage,
                'current_page' => $page,
                'last_page'    => (int) ceil($total / $perPage),
            ],
            'meta' => [
                'generated_at' => now()->toISOString(),
            ],
        ]);
    }

    public function show(string $ref, Request $request)
    {
        $user = Auth::user();
        abort_if(!$user, 401, 'Unauthenticated');

        if (str_starts_with(strtoupper($ref), 'DEM-')) {

            $demande = Demande::query()
                ->where('ref', $ref)
                ->where('created_by', $user->id)
                ->firstOrFail();

            $events = DemandeEvent::query()
                ->where('demande_id', $demande->id)
                ->orderByDesc('id')
                ->limit(100)
                ->get(['id', 'event', 'payload', 'actor_id', 'actor_name', 'created_at']);

            $files = DemandeFile::query()
                ->where('demande_id', $demande->id)
                ->orderByDesc('id')
                ->get(['id', 'tag', 'original_name', 'path', 'mime', 'size', 'created_at']);

            $messages = DemandeMessage::query()
                ->where('demande_id', $demande->id)
                ->where(function ($q) {
                    $q->whereNull('is_internal')->orWhere('is_internal', false);
                })
                ->orderBy('id')
                ->get(['id', 'sender_id', 'sender_role', 'body', 'created_at']);

            $statusProgress = [
                'recu' => 10,
                'en_cours' => 50,
                'en_attente_client' => 30,
                'en_revision' => 75,
                'pret' => 100,
                'termine' => 100,
                'annule' => 100,
            ];
            $progress = $demande->progress ?? ($statusProgress[strtolower($demande->status)] ?? 0);

            return response()->json([
                'kind'    => 'demande',
                'demande' => [
                    'ref'         => $demande->ref,
                    'status'      => $demande->status,
                    'type'        => [
                        'slug'    => $demande->type_slug,
                        'name'    => data_get($demande->meta, 'type_name'),
                        'version' => (int) $demande->type_version,
                    ],
                    'priority'    => $demande->priority,
                    'paid_status' => $demande->paid_status,
                    'paid_amount' => $demande->paid_amount,
                    'submitted_at' => optional($demande->submitted_at)->toISOString(),
                    'progress'    => $progress,
                    'description' => data_get($demande->data, 'description') ?? null,
                ],
                'events'   => $events,
                'files'    => $files,
                'messages' => $messages,
            ]);
        }

        $formation = Formation::query()
            ->where('code', $ref)
            ->firstOrFail();

        $registration = Registration::query()
            ->where('formation_id', $formation->id)
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'kind'       => 'formation',
            'formation'  => [
                'code'        => $formation->code,
                'title'       => $formation->title,
                'description' => $formation->description,
                'price_cfa'   => (int) ($formation->price_cfa ?? 0),
                'price_type'  => $formation->price_type,
                'duration'    => $formation->duration,
                'type'        => $formation->type,
                'level'       => $formation->level,
                'date'        => optional($formation->date)->toDateString(),
                'trainer'     => $formation->trainer,
                'modules'     => $formation->modules,
                'active'      => (bool) $formation->active,
            ],
            'registration' => $registration ? [
                'status'         => $registration->status,
                'amount_cfa'     => (int) ($registration->amount_cfa ?? $formation->price_cfa ?? 0),
                'session_format' => $registration->session_format,
                'experience'     => $registration->experience,
                'created_at'     => optional($registration->created_at)->toISOString(),
            ] : null,
        ]);
    }
}
