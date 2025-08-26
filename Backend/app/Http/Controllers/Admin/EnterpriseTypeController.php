<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseTypeUpsertRequest;
use App\Models\EnterpriseType;
use Illuminate\Http\Request;

class EnterpriseTypeController extends Controller
{
    /**
     * GET /api/v1/admin/enterprise-types
     */
    public function index(Request $request)
    {
        $q = EnterpriseType::query()->orderBy('sigle');

        if ($s = trim((string) $request->input('q'))) {
            $q->where(function ($qq) use ($s) {
                $qq->where('sigle', 'like', "%{$s}%")
                    ->orWhere('signification', 'like', "%{$s}%");
            });
        }

        $items = $q->get()->map(fn($t) => [
            'id'            => $t->id,
            'sigle'         => $t->sigle,
            'signification' => $t->signification,
            'description'   => $t->description,
        ]);

        return response()->json(['items' => $items]);
    }

    /**
     * POST /api/v1/admin/enterprise-types
     */
    public function store(EnterpriseTypeUpsertRequest $request)
    {
        $t = EnterpriseType::create($request->validated());

        return response()->json([
            'id'            => $t->id,
            'sigle'         => $t->sigle,
            'signification' => $t->signification,
            'description'   => $t->description,
        ], 201);
    }

    /**
     * GET /api/v1/admin/enterprise-types/{enterpriseType}
     */
    public function show(EnterpriseType $enterpriseType)
    {
        return response()->json([
            'id'            => $enterpriseType->id,
            'sigle'         => $enterpriseType->sigle,
            'signification' => $enterpriseType->signification,
            'description'   => $enterpriseType->description,
        ]);
    }

    /**
     * PATCH /api/v1/admin/enterprise-types/{enterpriseType}
     */
    public function update(EnterpriseTypeUpsertRequest $request, EnterpriseType $enterpriseType)
    {
        $enterpriseType->update($request->validated());

        return response()->json([
            'id'            => $enterpriseType->id,
            'sigle'         => $enterpriseType->sigle,
            'signification' => $enterpriseType->signification,
            'description'   => $enterpriseType->description,
        ]);
    }

    /**
     * DELETE /api/v1/admin/enterprise-types/{enterpriseType}
     */
    public function destroy(EnterpriseType $enterpriseType)
    {
        $enterpriseType->delete();

        return response()->json(['ok' => true]);
    }

    public function offersCounts()
    {
        $rows = EnterpriseType::withCount('offers')->get(['id', 'sigle']);
        $items = $rows->map(fn($t) => [
            'id' => $t->id,
            'sigle' => $t->sigle,
            'offers_count' => (int) $t->offers_count,
        ])->values();

        return response()->json(['items' => $items]);
    }
}
