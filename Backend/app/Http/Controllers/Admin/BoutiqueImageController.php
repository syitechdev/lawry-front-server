<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use Illuminate\Http\Request;

class BoutiqueImageController extends Controller
{
    public function store(Request $request, Boutique $boutique)
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,avif,gif,svg', 'max:5120'],
        ]);

        $boutique->fill([]); //
        $boutique->save();

        return response()->json($boutique->fresh(), 200);
    }
}
