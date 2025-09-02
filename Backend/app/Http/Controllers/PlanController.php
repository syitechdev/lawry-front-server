<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plan;
use App\Models\Subscription;

class PlanController extends Controller
{
    public function publicIndex()
    {
        return Plan::where('is_active', true)
            ->orderBy('sort_index')
            ->get();
    }


    public function mySubscriptions(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Non authentifié'
            ], 401);
        }

        $subs = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->latest('id')
            ->get();

        return response()->json([
            'items' => $subs,
        ]);
    }
}
