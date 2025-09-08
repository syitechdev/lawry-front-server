<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

// API Platform
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ApiResource(
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\ArticleUpsertRequest::class,
    operations: [
        new GetCollection(),
        new Get(),
        new Post(middleware: ['auth:sanctum', 'permission:articles.create']),
        new Patch(middleware: ['auth:sanctum', 'permission:articles.update']),
        new Delete(middleware: ['auth:sanctum', 'permission:articles.delete']),
    ],
)]

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category_id',
        'status',
        'excerpt',
        'content',
        'views_count',
        'image_url',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'views_count'  => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    protected static function booted(): void
    {
        static::saving(function (Article $a) {
            if (request()->has('category')) {
                $cat = request('category');
                $id = null;

                if (is_string($cat)) {
                    if (preg_match('#/categories/(\d+)#', $cat, $m)) {
                        $id = (int) $m[1];
                    } elseif (ctype_digit($cat)) {
                        $id = (int) $cat;
                    }
                } elseif (is_int($cat)) {
                    $id = $cat;
                }

                if ($id !== null && $id > 0) {
                    $a->category_id = $id;
                }
            }

            // 2) Slug auto & mises à jour
            if (!empty($a->title)) {
                if (empty($a->slug) || $a->isDirty('title')) {
                    $a->slug = static::uniqueSlugFromTitle($a->title, $a->id);
                }
            }

            if (empty($a->status)) {
                $a->status = 'draft';
            }

            if (request()->hasFile('image')) {
                $path = request()->file('image')->store('articles', 'public');
                $a->image_url = \Illuminate\Support\Facades\Storage::url($path);
            }

            if (empty($a->image_url)) {
                $a->image_url = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop';
            }
        });
    }


    /**
     * Génère un slug unique à partir d'un titre, en ajoutant -2
     */
    protected static function uniqueSlugFromTitle(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 2;

        $query = static::where('slug', $slug);
        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        while ($query->exists()) {
            $slug = "{$base}-{$i}";
            $query = static::where('slug', $slug);
            if ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            }
            $i++;
        }

        return $slug;
    }
}
