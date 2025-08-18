<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use Illuminate\Http\Request;

class PublicFormationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int)($request->integer('itemsPerPage') ?: 12);
        $q = Formation::query()->where('active', true);
        if ($request->filled('search')) {
            $s = $request->string('search');
            $q->where(function ($w) use ($s) {
                $w->where('title', 'like', "%{$s}%")
                    ->orWhere('description', 'like', "%{$s}%");
            });
        }
        if ($request->input('order.date') === 'desc') {
            $q->orderByDesc('date')->orderByDesc('id');
        } elseif ($request->input('order.date') === 'asc') {
            $q->orderBy('date')->orderBy('id');
        } else {
            $q->orderByDesc('id');
        }
        $p = $q->paginate($perPage)->appends($request->query());
        return response()->json([
            'data' => $p->getCollection()->map(function (Formation $f) {
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
                    'date' => optional($f->date)->toDateString(),
                    'trainer' => $f->trainer,
                    'active' => $f->active,
                    'category_id' => $f->category_id,
                    'modules' => $f->modules,
                    'code' => $f->code,
                ];
            })->values(),
            'meta' => [
                'current_page' => $p->currentPage(),
                'per_page' => $p->perPage(),
                'total' => $p->total(),
                'last_page' => $p->lastPage(),
            ],
        ]);
    }
}
