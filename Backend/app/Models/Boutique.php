<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ApiResource(
    operations: [new GetCollection(), new Get(), new Post(), new Patch(), new Delete()],
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\BoutiqueUpsertRequest::class,
)]
class Boutique extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'price_cfa',
        'description',
        'files',
        'is_active',
        'image_path',
        'category',
        'category_id',
        'categoryId',
        'downloads_count',
        'rating',
    ];

    protected $casts = [
        'price_cfa'       => 'integer',
        'is_active'       => 'boolean',
        'files'           => 'array',
        'downloads_count' => 'integer',
        'rating'          => 'decimal:1',
    ];

    protected static function booted()
    {
        static::creating(function (self $b) {
            if (empty($b->code)) {
                $next = (int) (self::max('id') ?? 0) + 1;
                $b->code = 'PROD' . str_pad((string)$next, 3, '0', STR_PAD_LEFT);
            }
        });

        static::saving(function (self $b) {
            if (empty($b->category_id)) {
                $cands = [];

                foreach (['category_id', 'categoryId', 'category'] as $k) {
                    if (!is_null($b->getAttribute($k))) {
                        $cands[] = $b->getAttribute($k);
                    }
                }
                $req = request();
                if ($req) {
                    foreach (['category_id', 'categoryId', 'category'] as $k) {
                        if ($req->has($k)) $cands[] = $req->input($k);
                    }
                }

                foreach ($cands as $val) {
                    if (is_string($val) && preg_match('/\/(\d+)(\?.*)?$/', $val, $m)) {
                        $b->category_id = (int) $m[1];
                        break;
                    }
                    if (is_array($val) && isset($val['@id']) && preg_match('/\/(\d+)(\?.*)?$/', $val['@id'], $m)) {
                        $b->category_id = (int) $m[1];
                        break;
                    }
                    if (is_array($val) && isset($val['id'])) {
                        $b->category_id = (int) $val['id'];
                        break;
                    }
                    if (is_numeric($val)) {
                        $b->category_id = (int) $val;
                        break;
                    }
                }
            }

            $file = request()->file('image') ?? request()->file('file');
            if ($file) {
                if ($b->getOriginal('image_path')) {
                    Storage::disk('public')->delete($b->getOriginal('image_path'));
                }
                $path = $file->store('boutique', 'public');
                $b->image_path = $path;
            }
            if (request()->filled('image_url')) {
                $b->image_path = request('image_url');
            }
        });
    }


    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        if ($this->image_path) {
            if (preg_match('#^https?://#i', $this->image_path)) {
                return $this->image_path;
            }
            return asset('storage/' . $this->image_path);
        }
        return null;
    }
}
