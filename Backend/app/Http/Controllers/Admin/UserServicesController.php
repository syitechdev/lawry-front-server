<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class UserServicesController extends Controller
{
    private const TYPES = [
        'subscription' => \App\Models\Subscription::class,
        'formation'    => \App\Models\Formation::class,
        'demande'      => \App\Models\Demande::class,
    ];

    private function mapRow(string $type, $model): array
    {
        $get = fn($obj, $key, $def = null) => data_get($obj, $key, $def);
        $has = fn($table, $col) => Schema::hasColumn($table, $col);

        $table = $model->getTable();

        $id        = (int) $get($model, 'id');
        $createdAt = $get($model, 'created_at');
        $updatedAt = $get($model, 'updated_at');
        $statusRaw = (string) ($get($model, 'status') ?? $get($model, 'etat') ?? 'inactive');

        $status = match (strtolower($statusRaw)) {
            'active', 'actif' => 'active',
            'pending', 'en_attente', 'à valider', 'a_valider' => 'pending',
            'expired', 'expiré', 'expire' => 'expired',
            default => 'inactive',
        };

        // label
        $label =
            $get($model, 'plan.name') ??
            $get($model, 'name') ??
            $get($model, 'title') ??
            $get($model, 'objet') ??
            ($type . ' #' . $id);

        // période / dates
        $period   = $get($model, 'period');
        $started  = $get($model, 'current_cycle_start') ?? $get($model, 'started_at') ?? $get($model, 'start_at');
        $ended    = $get($model, 'current_cycle_end')   ?? $get($model, 'ends_at')   ?? $get($model, 'end_at');

        // montant (subscription: depuis plan mensuel/annuel)
        $amountXof = null;
        if ($type === 'subscription') {
            $periodNorm = strtolower((string) $period);
            $amountXof = $periodNorm === 'yearly'
                ? (int) ($get($model, 'plan.yearly_price_cfa') ?? 0)
                : (int) ($get($model, 'plan.monthly_price_cfa') ?? 0);
        } elseif ($has($table, 'price_cfa')) {
            $amountXof = (int) $get($model, 'price_cfa');
        }

        // dernier paiement via relation morphOne lastPayment() si présente
        $lastRef = null;
        $lastStatus = null;
        $lastAt = null;
        if (method_exists($model, 'lastPayment')) {
            $last = $model->lastPayment()->first();
            $lastRef    = $last?->reference;
            $lastStatus = $last?->status;
            $lastAt     = optional($last?->paid_at)->toISOString();
        }

        return [
            'type'            => $type,
            'id'              => $id,
            'label'           => (string) $label,
            'status'          => $status,
            'startedAt'       => optional($started)->toISOString(),
            'endsAt'          => optional($ended)->toISOString(),
            'createdAt'       => optional($createdAt)->toISOString(),
            'updatedAt'       => optional($updatedAt)->toISOString(),
            'period'          => $period,
            'amountXof'       => $amountXof,
            'lastPaymentRef'  => $lastRef,
            'lastPaymentStatus' => $lastStatus,
            'lastPaymentAt'   => $lastAt,
        ];
    }

    private function baseQuery(string $type, string $class, int $userId)
    {
        // jointures “soft” selon colonnes dispo
        $m = new $class;
        $q = $class::query();

        // filtrer par user_id si la colonne existe
        $table = $m->getTable();
        if (Schema::hasColumn($table, 'user_id')) {
            $q->where("{$table}.user_id", $userId);
        } else {
            // fallback : si relation user() existe
            if (method_exists($m, 'user')) {
                $q->whereHas('user', fn($uq) => $uq->where('users.id', $userId));
            }
        }

        // eager possibles
        if ($type === 'subscription') {
            $q->with(['plan:id,name,monthly_price_cfa,yearly_price_cfa']);
        }

        return $q;
    }

    public function index(User $user, Request $request)
    {
        $perPage = max(1, (int) $request->integer('perPage', 10));
        $page    = max(1, (int) $request->integer('page', 1));
        $q       = trim((string) $request->get('q', ''));

        $all = collect();

        foreach (self::TYPES as $type => $class) {
            if (!class_exists($class)) continue;

            $qBase = $this->baseQuery($type, $class, $user->id);

            if ($q !== '') {
                $qBase->where(function ($qq) use ($q) {
                    $qq->where('status', 'like', "%{$q}%")
                        ->orWhere('period', 'like', "%{$q}%")
                        ->orWhere('name', 'like', "%{$q}%")
                        ->orWhere('title', 'like', "%{$q}%")
                        ->orWhere('objet', 'like', "%{$q}%");
                });
            }

            $rows = $qBase->orderByDesc('id')->get();
            foreach ($rows as $row) {
                $all->push($this->mapRow($type, $row));
            }
        }

        // tri global & pagination côté serveur (après agrégation)
        $sorted = $all->sortByDesc(fn($r) => $r['createdAt'] ?? '')->values();
        $total  = $sorted->count();
        $slice  = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'data'    => $slice,
            'total'   => $total,
            'page'    => $page,
            'perPage' => $perPage,
        ]);
    }

    public function summary(User $user)
    {
        $counts = ['total' => 0, 'active' => 0, 'pending' => 0, 'expired' => 0, 'inactive' => 0];

        foreach (self::TYPES as $type => $class) {
            if (!class_exists($class)) continue;

            $qBase = $this->baseQuery($type, $class, $user->id);
            $rows  = $qBase->select(['id', 'status'])->get();

            foreach ($rows as $r) {
                $counts['total']++;
                $status = match (strtolower((string) ($r->status ?? ''))) {
                    'active', 'actif' => 'active',
                    'pending', 'en_attente', 'à valider', 'a_valider' => 'pending',
                    'expired', 'expiré', 'expire' => 'expired',
                    default => 'inactive',
                };
                $counts[$status]++;
            }
        }

        return response()->json($counts);
    }
}
