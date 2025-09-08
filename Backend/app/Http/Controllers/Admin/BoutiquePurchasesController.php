<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\Boutique;
use Illuminate\Http\Request;


class BoutiquePurchasesController extends Controller
{
    public function index(Request $request, int $id)
    {
        $perPage = (int) $request->integer('per_page', 12);
        $boutique = Boutique::findOrFail($id);

        $base = Purchase::with('user')
            ->where('boutique_id', $id)
            ->latest('id');

        $paginator = (clone $base)->paginate($perPage);

        $rows = $paginator->getCollection()->map(function (Purchase $p) {
            return [
                'id'         => $p->id,
                'ref'        => $p->ref,
                'status'     => $p->status,
                'amount'     => $p->unit_price_cfa,
                'currency'   => $p->currency,
                'created_at' => optional($p->created_at)->toISOString(),
                'delivered_at' => optional($p->delivered_at)->toISOString(),
                'user'       => [
                    'id'    => $p->user?->id,
                    'name'  => $p->user?->name,
                    'email' => $p->user?->email,
                ],
            ];
        });

        $paid = (clone $base)->where('status', 'paid');
        $stats = [
            'product'        => ['id' => $boutique->id, 'name' => $boutique->name, 'type' => $boutique->type],
            'purchases'      => (clone $base)->count(),
            'paid_purchases' => (clone $paid)->count(),
            'revenue_cfa'    => (int) (clone $paid)->sum('unit_price_cfa'),
        ];

        return response()->json([
            'stats'        => $stats,
            'data'         => $rows,
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'total'        => $paginator->total(),
        ]);
    }

    public function statistiqueBoutique(Request $request)
    {
        // Produits
        $totalProducts = \App\Models\Boutique::count();
        $activeProducts = \App\Models\Boutique::where('is_active', true)->count();

        // Achats payés
        $paid = \App\Models\Purchase::where('status', 'paid');

        // CA total (tous types)
        $revenueCfa = (clone $paid)->sum('unit_price_cfa');

        // Achats de produits
        $totalPurchases = (clone $paid)->count();

        return response()->json([
            'total_products'   => (int) $totalProducts,
            'active_products'  => (int) $activeProducts,
            'downloads_count'  => (int) $totalPurchases,
            'revenue_cfa'      => (int) $revenueCfa,      // = CA total (paid)
        ]);
    }
}
