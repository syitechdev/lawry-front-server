<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BoutiqueFilesController extends Controller
{
    public function store(Request $request, Boutique $boutique)
    {
        $request->validate([
            'files'   => ['required', 'array', 'min:1'],
            'files.*' => ['file', 'max:10240'], //
        ]);

        if ($boutique->type !== 'file') {
            return response()->json(['message' => 'Cette boutique n\'accepte pas des fichiers (type != file).'], 422);
        }

        $boutique->save();

        return response()->json($boutique->fresh(), 200);
    }

    public function destroy(Boutique $boutique, Request $request)
    {
        $request->validate([
            'path' => ['required', 'string'],
        ]);

        $files = is_array($boutique->files) ? $boutique->files : [];
        $path  = $request->string('path');

        $files = array_values(array_filter($files, fn($p) => $p !== $path));
        $boutique->files = $files;
        $boutique->save();

        if ($path && !preg_match('#^https?://#i', $path)) {
            Storage::disk('public')->delete($path);
        }

        return response()->json($boutique->fresh(), 200);
    }
}
