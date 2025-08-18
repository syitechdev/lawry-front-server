<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $file = $request->file('file') ?? $request->file('image');
        if (!$file) {
            return response()->json(['message' => 'Aucun fichier reçu (file/image)'], 422);
        }

        $request->validate([
            'file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,avif,gif,svg', 'max:5120'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,avif,gif,svg', 'max:5120'],
        ]);

        $path = $file->store('uploads', 'public');
        $mime = $file->getClientMimeType();
        $size = $file->getSize();

        $w = null;
        $h = null;
        try {
            if (@is_array(getimagesize($file->getRealPath()))) {
                [$w, $h] = getimagesize($file->getRealPath());
            }
        } catch (\Throwable $e) {
        }

        return response()->json([
            'url'    => asset('storage/' . $path),
            'path'   => $path,
            'mime'   => $mime,
            'size'   => $size,
            'width'  => $w,
            'height' => $h,
        ]);
    }
}
