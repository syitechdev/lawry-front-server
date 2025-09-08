<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;


class ArticlePublicController extends Controller
{

    public function index(Request $r)
    {
        $perPage = max(1, min(50, (int) $r->get('per_page', 12)));

        $q = Article::query()
            ->where('status', 'published')
            ->with(['category:id,name'])
            ->orderByDesc('published_at')
            ->orderByDesc('created_at');

        $p = $q->paginate($perPage);

        return response()->json([
            'items'   => $p->getCollection()->map(fn($a) => $this->mapArticle($a)),
            'total'   => $p->total(),
            'page'    => $p->currentPage(),
            'perPage' => $p->perPage(),
        ]);
    }


    public function show(string $slugOrId)
    {
        $article = Article::query()
            ->when(
                ctype_digit($slugOrId),
                fn($q) => $q->where('id', (int) $slugOrId),
                fn($q) => $q->where('slug', $slugOrId)
            )
            ->where('status', 'published')
            ->with(['category:id,name'])
            ->first();

        if (!$article) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $key = 'article_viewed:' . $article->id . ':' . request()->ip();
        if (!cache()->has($key)) {
            $article->increment('views_count');
            cache()->put($key, true, now()->addMinutes(30));
        }

        return response()->json($this->mapArticle($article));
    }


    public function trackView(int $id)
    {
        $article = Article::where('id', $id)->where('status', 'published')->firstOrFail();

        $key = 'article_viewed:' . $article->id . ':' . request()->ip();
        if (!cache()->has($key)) {
            $article->increment('views_count');
            cache()->put($key, true, now()->addMinutes(30));
        }

        return response()->noContent();
    }

    private function mapArticle(Article $a): array
    {
        return [
            'id'          => $a->id,
            'title'       => $a->title,
            'slug'        => $a->slug,
            'status'      => $a->status,
            'excerpt'     => (string) ($a->excerpt ?? ''),
            'content'     => (string) ($a->content ?? ''),
            'imageUrl'    => $a->image_url ?? $a->imageUrl ?? null,
            'categoryIri' => $a->category_id ? "/api/categories/{$a->category_id}" : null,
            'categoryObj' => $a->relationLoaded('category') && $a->category ? [
                'id'   => $a->category->id,
                'name' => $a->category->name,
            ] : null,
            'publishedAt' => optional($a->published_at)->toISOString(),
            'createdAt'   => optional($a->created_at)->toISOString(),
            'updatedAt'   => optional($a->updated_at)->toISOString(),
            'viewsCount'  => $a->views_count,
        ];
    }
}
