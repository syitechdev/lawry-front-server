<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TarifUniqueUpsertRequest;
use App\Models\TarifUnique;
use Illuminate\Http\Request;

class TarifUniqueActiveController extends Controller
{
    public function update(Request $request, TarifUnique $tarif)
    {
        $tarif->actif = $request->boolean('actif');
        $tarif->save();

        return response()->json($tarif);
    }
}
