<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use Illuminate\Http\Request;
use App\Models\Category;

class PublicBoutiquesController extends Controller
{
    public function index(Request $req)
    {
        $q        = $req->string('q');
        $category = $req->input('category_id');
        $perPage  = (int) $req->input('per_page', 20);

        $query = Boutique::query()
            ->where('is_active', true)
            ->with(['category:id,name,slug']) //
            ->select(['id', 'name', 'code', 'price_cfa', 'description', 'image_path', 'category_id', 'rating'])
            ->orderByDesc('id');

        if ($q->isNotEmpty()) {
            $query->where(function ($qq) use ($q) {
                $qq->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            });
        }
        if (!empty($category)) {
            $query->where('category_id', (int)$category);
        }

        $page = $query->paginate($perPage);

        $page->getCollection()->transform(function (\App\Models\Boutique $b) {
            return [
                'id'            => $b->id,
                'name'          => $b->name,
                'code'          => $b->code,
                'price_cfa'     => $b->price_cfa,
                'description'   => $b->description,
                'category_id'   => $b->category_id,
                'category_name' => optional($b->category)->name,
                'category_slug' => optional($b->category)->slug,
                'rating'        => (float)$b->rating,
                'image_url'     => $b->image_url,
            ];
        });

        return response()->json($page);
    }

    public function indexCategorie()
    {
        return Category::query()
            ->select(['id', 'name', 'slug'])
            ->orderBy('name')
            ->get();
    }
}
