<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlanPopularRequest;
use App\Models\Plan;

class PlanPopularController extends Controller
{
    public function update(PlanPopularRequest $request, Plan $plan)
    {
        $plan->is_popular = $request->boolean('is_popular');
        $plan->save();

        return response()->json($plan);
    }
}
