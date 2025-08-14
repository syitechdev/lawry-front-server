<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

// API Platform
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ApiResource(
    operations: [new GetCollection(), new Get(), new Post(), new Patch(), new Delete()],
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\FormationUpsertRequest::class,
)]
class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'code',
        'description',
        'price_cfa',
        'duration',
        'max_participants',
        'type',
        'date',
        'trainer',
        'active',
        'category',
        'category_id',
        'categoryId',
    ];

    protected $casts = [
        'active'           => 'boolean',
        'price_cfa'        => 'integer',
        'max_participants' => 'integer',
        'duration'         => 'string',
        'date'             => 'date:Y-m-d',
    ];

    protected static function booted()
    {
        static::creating(function (Formation $f) {
            if (empty($f->code)) {
                $next = (int) (Formation::max('id') ?? 0) + 1;
                $f->code = 'FORM' . str_pad((string)$next, 3, '0', STR_PAD_LEFT);
            }
        });

        static::saving(function (Formation $f) {
            if (!empty($f->category_id)) {
                return;
            }

            $candidates = [];

            if ($f->getAttribute('category') !== null)    $candidates[] = $f->getAttribute('category');
            if ($f->getAttribute('category_id') !== null) $candidates[] = $f->getAttribute('category_id');
            if ($f->getAttribute('categoryId') !== null)  $candidates[] = $f->getAttribute('categoryId');

            $req = request();
            if ($req) {
                foreach (['category', 'category_id', 'categoryId'] as $k) {
                    if ($req->has($k)) $candidates[] = $req->input($k);
                }
            }

            $id = null;
            foreach ($candidates as $val) {
                if (is_string($val)) {
                    if (preg_match('/\/(\d+)(\?.*)?$/', $val, $m)) {
                        $id = (int) $m[1];
                        break;
                    }
                } elseif (is_array($val)) {
                    if (isset($val['@id']) && is_string($val['@id']) && preg_match('/\/(\d+)(\?.*)?$/', $val['@id'], $m)) {
                        $id = (int) $m[1];
                        break;
                    }
                    if (isset($val['id'])) {
                        $id = (int) $val['id'];
                        break;
                    }
                } elseif (is_numeric($val)) {
                    $id = (int) $val;
                    break;
                }
            }

            if ($id) {
                $f->category_id = $id;
                return;
            }

            abort(response()->json([
                'message' => 'The category field must reference an existing category (IRI/object/id).',
                'errors'  => ['category' => ['Missing or invalid category reference.']],
            ], 422));
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function setCategoryAttribute($value): void
    {
        if (is_string($value)) {
            if (preg_match('/\/(\d+)(\?.*)?$/', $value, $m)) {
                $this->attributes['category_id'] = (int) $m[1];
            }
            return;
        }

        if (is_array($value)) {
            if (isset($value['@id']) && is_string($value['@id']) && preg_match('/\/(\d+)(\?.*)?$/', $value['@id'], $m)) {
                $this->attributes['category_id'] = (int) $m[1];
                return;
            }
            if (isset($value['id'])) {
                $this->attributes['category_id'] = (int) $value['id'];
                return;
            }
        }

        if ($value instanceof \App\Models\Category) {
            $this->attributes['category_id'] = (int) $value->getKey();
            $this->setRelation('category', $value);
            return;
        }

        if (is_numeric($value)) {
            $this->attributes['category_id'] = (int) $value;
        }
    }
    public function setCategoryIdAttribute($value): void
    {
        if ($value !== null && $value !== '') {
            $this->attributes['category_id'] = (int) $value;
        }
    }
    public function categoryId(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->attributes['category_id'] ?? null,
            set: fn($value) => ['category_id' => (int) $value],
        );
    }
}
