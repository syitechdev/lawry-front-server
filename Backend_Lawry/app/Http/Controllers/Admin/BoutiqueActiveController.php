<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BoutiqueActiveRequest;
use App\Models\Boutique;
use Illuminate\Http\Request;

class BoutiqueActiveController extends Controller
{
    public function update(BoutiqueActiveRequest $request, Boutique $boutique)
    {
        $boutique->is_active = $request->boolean('is_active');
        $boutique->save();

        return response()->json($boutique);
    }

    public function store(Request $request, Boutique $boutique)
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,avif,gif,svg', 'max:5120'],
        ]);
        $boutique->save();

        return response()->json($boutique->fresh(), 200);
    }
}
