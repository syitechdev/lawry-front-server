<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConseilGratuitStoreRequest;
use App\Http\Resources\ConseilGratuitResource;
use App\Models\ConseilGratuit;

class ConseilsGratuitsController extends Controller
{
    public function store(ConseilGratuitStoreRequest $request)
    {
        $payload = $request->validated();

        $model = ConseilGratuit::create([
            ...$payload,
            'status'  => 'nouveau',
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Votre demande a bien été envoyée.',
            'data'    => new ConseilGratuitResource($model),
        ], 201);
    }
}
