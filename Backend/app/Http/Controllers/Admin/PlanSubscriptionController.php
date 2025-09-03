<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;

class PlanSubscriptionController extends Controller
{
    public function index(Plan $plan, Request $request)
    {
        $perPage = max(1, (int) $request->integer('perPage', 10));
        $page    = max(1, (int) $request->integer('page', 1));
        $q       = trim((string) $request->get('q', ''));
        $status  = $request->get('status'); // 

        $query = Subscription::query()
            ->with(['user:id,name,email'])
            ->where('plan_id', $plan->id);

        if ($status && in_array($status, ['active', 'inactive', 'pending', 'expired'], true)) {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $query->whereHas('user', function ($uq) use ($q) {
                $uq->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $total = (clone $query)->count();

        $rows = $query
            ->orderByDesc('id')
            ->forPage($page, $perPage)
            ->get()
            ->map(function ($s) {
                return [
                    'id'         => $s->id,
                    'user_id'    => $s->user_id,
                    'user_name'  => optional($s->user)->name,
                    'user_email' => optional($s->user)->email,
                    'status'     => $s->status,
                    'started_at' => optional($s->current_cycle_start)->toISOString(),
                    'ends_at'    => optional($s->current_cycle_end)->toISOString(),

                ];
            })
            ->values();

        return response()->json([
            'data'  => $rows,
            'total' => $total,
            'page'  => $page,
            'perPage' => $perPage,
        ]);
    }

    public function summary(Plan $plan)
    {
        $base = Subscription::query()->where('plan_id', $plan->id);

        $total   = (clone $base)->count();
        $active  = (clone $base)->where('status', 'active')->count();
        $pending = (clone $base)->where('status', 'pending')->count();

        $inactive = max($total - $active - $pending, 0);

        return response()->json([
            'total'   => $total,
            'active'  => $active,
            'pending' => $pending,
            'inactive' => $inactive,
        ]);
    }
}
