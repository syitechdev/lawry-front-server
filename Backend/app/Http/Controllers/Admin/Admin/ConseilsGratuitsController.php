<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateConseilGratuitStatusRequest;
use App\Http\Resources\ConseilGratuitResource;
use App\Models\ConseilGratuit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;

class ConseilsGratuitsController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function index(Request $req)
    {
        $this->authorize('conseils.read');

        $q       = (string)$req->query('q', '');
        $status  = $req->query('status');
        $isReadQ = $req->query('is_read');

        $items = ConseilGratuit::query()
            ->search($q)
            ->status($status)
            ->when(!is_null($isReadQ), fn($qq) => $qq->where('is_read', filter_var($isReadQ, FILTER_VALIDATE_BOOL)))
            ->latest('created_at')
            ->paginate((int)$req->query('per_page', 20))
            ->appends($req->query());

        return ConseilGratuitResource::collection($items);
    }

    public function show(ConseilGratuit $conseil)
    {
        $this->authorize('conseils.read');
        return new ConseilGratuitResource($conseil);
    }

    public function markRead(Request $req, ConseilGratuit $conseil)
    {
        $this->authorize('conseils.update');

        if (!$conseil->is_read) {
            $conseil->forceFill([
                'is_read' => true,
                'read_at' => now(),
                'read_by' => optional($req->user())->id,
            ])->save();
        }
        return new ConseilGratuitResource($conseil);
    }

    public function markUnread(ConseilGratuit $conseil)
    {
        $this->authorize('conseils.update');

        $conseil->forceFill([
            'is_read' => false,
            'read_at' => null,
            'read_by' => null,
        ])->save();

        return new ConseilGratuitResource($conseil);
    }

    public function updateStatus(UpdateConseilGratuitStatusRequest $req, ConseilGratuit $conseil)
    {
        $this->authorize('conseils.update');

        $conseil->status = $req->validated('status');
        $conseil->save();

        return new ConseilGratuitResource($conseil);
    }

    public function destroy(ConseilGratuit $conseil)
    {
        $this->authorize('conseils.delete');
        $conseil->delete();
        return response()->json(['message' => 'Demande supprimée']);
    }

    public function stats()
    {
        $this->authorize('conseils.read');

        $total  = ConseilGratuit::count();
        $unread = ConseilGratuit::where('is_read', false)->count();
        $by     = ConseilGratuit::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')->pluck('count', 'status');

        return response()->json([
            'total'    => $total,
            'unread'   => $unread,
            'byStatus' => $by,
        ]);
    }
}
