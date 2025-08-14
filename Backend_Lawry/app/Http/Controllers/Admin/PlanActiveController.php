<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlanActiveRequest;
use App\Models\Plan;

class PlanActiveController extends Controller
{
    public function update(PlanActiveRequest $request, Plan $plan)
    {
        $plan->is_active = $request->boolean('is_active');
        $plan->save();

        return response()->json($plan);
    }
}
