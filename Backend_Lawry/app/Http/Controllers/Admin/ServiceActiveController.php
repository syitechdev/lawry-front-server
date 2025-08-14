<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceActiveRequest;
use App\Models\Service;

class ServiceActiveController extends Controller
{
    public function update(ServiceActiveRequest $request, Service $service)
    {
        $service->is_active = $request->boolean('is_active');
        $service->save();

        return response()->json($service);
    }
}
