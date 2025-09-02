<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

// API Platform
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\Laravel\Eloquent\Filter\PartialSearchFilter;
use ApiPlatform\Laravel\Eloquent\Filter\OrderFilter;

#[ApiResource(
    paginationItemsPerPage: 50,
    rules: \App\Http\Requests\PlanUpsertRequest::class,
    operations: [
        new GetCollection(), // public
        new Get(),           // public
        new Post(middleware: ['auth:sanctum', 'permission:plans.create']),
        new Patch(middleware: ['auth:sanctum', 'permission:plans.update']),
        new Delete(middleware: ['auth:sanctum', 'permission:plans.delete']),
    ],
)]
#[QueryParameter(key: ':property', filter: PartialSearchFilter::class)]
#[QueryParameter(key: 'sort[:property]', filter: OrderFilter::class)]
class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'code',
        'monthly_price_cfa',
        'yearly_price_cfa',
        'is_trial',
        'trial_days',
        'popular',
        'is_active',
        'color',
        'description',
        'features',
        'gradient_from',
        'gradient_to',
        'sort_index',
    ];

    protected $casts = [
        'monthly_price_cfa' => 'integer',
        'yearly_price_cfa'  => 'integer',
        'is_trial'          => 'boolean',
        'popular'           => 'boolean',
        'is_active'         => 'boolean',
        'features'          => 'array',
        'trial_days'        => 'integer',
        'sort_index'        => 'integer',
    ];

    protected static function booted()
    {
        static::saving(function (Plan $p) {
            // -------- 1) CODE UNIQUE type PLAN001, PLAN002, ... --------
            if (empty($p->code)) {
                // Récupère le max numérique des codes existants (CAST(SUBSTRING(code,5) AS UNSIGNED))
                $maxNum = \DB::table('plans')
                    ->whereNotNull('code')
                    ->where('code', 'REGEXP', '^PLAN[0-9]+$')
                    ->selectRaw('MAX(CAST(SUBSTRING(code,5) AS UNSIGNED)) as maxnum')
                    ->value('maxnum');

                $seq = (int)($maxNum ?? 0) + 1;

                // Cherche le prochain code libre
                do {
                    $candidate = 'PLAN' . str_pad((string)$seq, 3, '0', STR_PAD_LEFT);
                    $exists = Plan::query()
                        ->when($p->exists, fn($q) => $q->where('id', '!=', $p->id))
                        ->where('code', $candidate)
                        ->exists();
                    $seq++;
                } while ($exists);

                $p->code = $candidate;
            }

            // -------- 2) SLUG UNIQUE si vide --------
            if (empty($p->slug)) {
                $base = trim(($p->name ?: 'plan') . '-' . ($p->code ?: ''));
                $base = \Illuminate\Support\Str::slug($base) ?: 'plan';
                $base = \Illuminate\Support\Str::limit($base, 180, '');

                $slug = $base;
                $i = 1;
                $exists = Plan::query()
                    ->when($p->exists, fn($q) => $q->where('id', '!=', $p->id))
                    ->where('slug', $slug)
                    ->exists();

                while ($exists) {
                    $slug = \Illuminate\Support\Str::limit($base, 180, '') . '-' . $i;
                    $i++;
                    $exists = Plan::query()
                        ->when($p->exists, fn($q) => $q->where('id', '!=', $p->id))
                        ->where('slug', $slug)
                        ->exists();
                }

                $p->slug = $slug;
            }

            if (empty($p->gradient_from)) {
                $p->gradient_from = 'from-blue-500';
            }
            if (empty($p->gradient_to)) {
                $p->gradient_to = 'to-blue-600';
            }
        });
    }


    protected $appends = ['gradient'];

    public function getGradientAttribute(): string
    {
        return trim(($this->gradient_from ?: 'from-blue-500') . ' ' . ($this->gradient_to ?: 'to-blue-600'));
    }
}
