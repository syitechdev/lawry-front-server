<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ApiResource(
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\FormationUpsertRequest::class,
    operations: [
        new GetCollection(),
        new Get(),
        new Post(middleware: ['auth:sanctum', 'permission:formations.create']),
        new Patch(middleware: ['auth:sanctum', 'permission:formations.update']),
        new Delete(middleware: ['auth:sanctum', 'permission:formations.delete']),
    ],
)]

class Formation extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'code',
        'description',
        'price_cfa',
        'price_type',
        'duration',
        'max_participants',
        'type',
        'level',
        'date',
        'trainer',
        'active',
        'modules',
        'category_id',
    ];

    protected $casts = [
        'active'           => 'boolean',
        'price_cfa'        => 'integer',
        'max_participants' => 'integer',
        'date'             => 'date:Y-m-d',
        'modules'          => 'array',
    ];

    protected static function booted()
    {
        static::creating(function (Formation $f) {
            if (empty($f->code)) {
                $next = (int) (Formation::max('id') ?? 0) + 1;
                $f->code = 'FORM' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function categoryId(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->attributes['category_id'] ?? null,
            set: fn($value) => ['category_id' => (int) $value],
        );
    }

    public function registrationItems()
    {
        return $this->hasMany(RegistrationItem::class);
    }
}
