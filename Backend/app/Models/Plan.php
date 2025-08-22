<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

// API Platform
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ApiResource(
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\PlanUpsertRequest::class,
    operations: [
        new GetCollection(),
        new Get(),
        new Post(middleware: ['auth:sanctum', 'permission:plans.create']),
        new Patch(middleware: ['auth:sanctum', 'permission:plans.update']),
        new Delete(middleware: ['auth:sanctum', 'permission:plans.delete']),
    ],
)]
class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'price_cfa',
        'period',
        'color',
        'description',
        'features',
        'is_popular',
        'is_active',
        'popular',
        'active', // alias UI
    ];

    protected $casts = [
        'price_cfa'  => 'integer',
        'is_popular' => 'boolean',
        'is_active'  => 'boolean',
        'features'   => 'array',
    ];

    protected static function booted()
    {
        static::creating(function (Plan $p) {
            if (empty($p->code)) {
                $next = (int) (Plan::max('id') ?? 0) + 1;
                $p->code = 'PLAN' . str_pad((string)$next, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    // alias écriture UI -> colonnes réelles
    public function setActiveAttribute($value): void
    {
        $this->attributes['is_active']  = (bool)$value;
    }
    public function setPopularAttribute($value): void
    {
        $this->attributes['is_popular'] = (bool)$value;
    }
}
