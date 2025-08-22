<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestTypeRequest;
use App\Models\RequestType;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequestTypeController extends Controller
{
    public function index(Request $req)
    {
        $q = RequestType::query()
            ->withCount('demandes')
            ->orderBy('name');

        return $q->get();
    }

    public function show(RequestType $requestType)
    {
        $requestType->loadCount('demandes');
        return $requestType;
    }

    public function store(RequestTypeRequest $req)
    {
        $rt = RequestType::create($req->validated());
        $rt->loadCount('demandes');
        return response()->json($rt, Response::HTTP_CREATED);
    }

    public function update(RequestTypeRequest $req, RequestType $requestType)
    {
        $data = $req->validated();

        // interdiction de passer is_active=false si des demandes existent
        if (array_key_exists('is_active', $data) && $data['is_active'] === false) {
            if ($requestType->demandes()->exists()) {
                return response()->json([
                    'message' => "Impossible de désactiver ce type : des demandes y sont liées."
                ], Response::HTTP_CONFLICT);
            }
        }

        $requestType->update($data);
        $requestType->loadCount('demandes');
        return $requestType;
    }

    public function toggle(Request $req, RequestType $requestType)
    {
        $active = (bool)$req->boolean('is_active');
        if ($active === false && $requestType->demandes()->exists()) {
            return response()->json([
                'message' => "Impossible de désactiver ce type : des demandes y sont liées."
            ], Response::HTTP_CONFLICT);
        }

        $requestType->update(['is_active' => $active]);
        $requestType->loadCount('demandes');
        return $requestType;
    }

    public function destroy(RequestType $requestType)
    {
        if ($requestType->demandes()->exists()) {
            return response()->json([
                'message' => "Impossible de supprimer ce type : des demandes y sont liées."
            ], Response::HTTP_CONFLICT);
        }

        $requestType->delete();
        return response()->noContent();
    }


    public function publicContrats()
    {
        $rt = RequestType::where('slug', 'rediger-contrat')
            ->where('is_active', true)
            ->firstOrFail();

        // on expose le "catalogue" + variantes actives (sans form_schema)
        return [
            'type' => [
                'name'         => $rt->name,
                'slug'         => $rt->slug,
                'version'      => $rt->version,
                'pricing_mode' => $rt->pricing_mode,
                'price_amount' => $rt->price_amount,
                'currency'     => $rt->currency,
            ],
            'variants' => collect($rt->variantsActive())->map(function ($v) {
                return [
                    'key'          => data_get($v, 'key'),
                    'title'        => data_get($v, 'title'),
                    'subtitle'     => data_get($v, 'subtitle'),
                    'features'     => data_get($v, 'features', []),
                    'pricing_mode' => data_get($v, 'pricing_mode'),
                    'price_amount' => data_get($v, 'price_amount'),
                    'currency'     => data_get($v, 'currency'),
                    'order'        => data_get($v, 'order', 999),
                ];
            })->values(),
        ];
    }

    public function publicContratVariant(string $key)
    {
        $rt = RequestType::where('slug', 'rediger-contrat')
            ->where('is_active', true)
            ->firstOrFail();

        $variant = $rt->findVariant($key, true);
        abort_if(!$variant, 404, 'Variante introuvable ou désactivée');

        return [
            'type' => [
                'slug'    => $rt->slug,
                'version' => $rt->version,
            ],
            'variant' => [
                'key'          => data_get($variant, 'key'),
                'title'        => data_get($variant, 'title'),
                'subtitle'     => data_get($variant, 'subtitle'),
                'features'     => data_get($variant, 'features', []),
                'pricing_mode' => data_get($variant, 'pricing_mode'),
                'price_amount' => data_get($variant, 'price_amount'),
                'currency'     => data_get($variant, 'currency'),
                'form_schema'  => data_get($variant, 'form_schema', []),
            ],
        ];
    }
}
