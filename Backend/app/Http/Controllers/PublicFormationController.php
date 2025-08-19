<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    public function indexPublic(Request $request)
    {
        $perPage = (int) $request->query('perPage', 12);
        if ($perPage < 1) $perPage = 12;
        if ($perPage > 50) $perPage = 50;

        $paginator = Formation::query()
            ->where('active', true)
            ->orderByDesc('date')
            ->paginate($perPage);

        $data = collect($paginator->items())->map(function (Formation $f) {
            return [
                'id' => $f->id,
                'title' => $f->title,
                'description' => $f->description,
                'price_cfa' => $f->price_cfa,
                'price_type' => $f->price_type,
                'duration' => $f->duration,
                'max_participants' => $f->max_participants,
                'type' => $f->type,
                'level' => $f->level,
                'date' => $f->date,
                'trainer' => $f->trainer,
                'active' => (bool) $f->active,
                'category_id' => $f->category_id,
                'modules' => $f->modules,
                'code' => $f->code ?? ('FORM' . str_pad((string)$f->id, 3, '0', STR_PAD_LEFT)),
            ];
        })->values();

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }
}
