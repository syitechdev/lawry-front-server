<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Purchase;

class MePurchasesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $paginator = Purchase::with('boutique')
            ->where('user_id', $user->id)
            ->latest('id')
            ->paginate((int) $request->integer('per_page', 12));

        $data = $paginator->getCollection()->map(function (Purchase $p) {
            $snap = $p->product_snapshot ?? [];
            $type = $snap['type'] ?? ($p->boutique->type ?? 'service');
            return [
                'id'               => $p->id,
                'ref'              => $p->ref,
                'status'           => $p->status,
                'unit_price_cfa'   => $p->unit_price_cfa,
                'currency'         => $p->currency,
                'delivered_at'     => optional($p->delivered_at)->toISOString(),
                'created_at'       => optional($p->created_at)->toISOString(),
                'product' => [
                    'name'       => $snap['name'] ?? $p->boutique->name,
                    'code'       => $snap['code'] ?? $p->boutique->code,
                    'type'       => $type,
                    'image_url'  => $snap['image_url'] ?? $p->boutique->image_url,
                    'files_urls' => $snap['files_urls'] ?? [],
                ],
            ];
        });

        return response()->json([
            'data'         => $data,
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'total'        => $paginator->total(),
        ]);
    }
}
