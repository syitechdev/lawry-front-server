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
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\Laravel\Eloquent\Filter\PartialSearchFilter;
use ApiPlatform\Laravel\Eloquent\Filter\OrderFilter;

#[ApiResource(
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\ServiceUpsertRequest::class,
    operations: [
        new GetCollection(), // public
        new Get(),           // public
        new Post(middleware: ['auth:sanctum', 'permission:services.create']),
        new Patch(middleware: ['auth:sanctum', 'permission:services.update']),
        new Delete(middleware: ['auth:sanctum', 'permission:services.delete']),
    ],
)]


#[QueryParameter(key: ':property', filter: PartialSearchFilter::class)]
#[QueryParameter(key: 'sort[:property]', filter: OrderFilter::class)]
class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'code',
        'is_active',
        'description',
        'price_cfa',
        'duration_days',
        'orders_count',
        'rating',
        'documents',
        'active',
        'statut',
    ];

    protected $casts = [
        'is_active'    => 'boolean',
        'documents'    => 'array',
        'price_cfa'    => 'integer',
        'duration_days' => 'string',
        'orders_count' => 'integer',
        'rating'       => 'float',
    ];

    protected static function booted()
    {
        static::creating(function (Service $s) {
            if (empty($s->code)) {
                $next = (int) (Service::max('id') ?? 0) + 1;
                $s->code = 'SRV' . str_pad((string)$next, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    /* =========================
       Mutateurs pour robustesse
       ========================= */
    public function setIsActiveAttribute($value): void
    {
        $this->attributes['is_active'] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    // alias UI: active -> is_active
    public function setActiveAttribute($value): void
    {
        $this->attributes['is_active'] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    // alias UI: "Actif"/"Inactif"
    public function setStatutAttribute($value): void
    {
        if (is_string($value)) {
            $v = mb_strtolower(trim($value));
            $this->attributes['is_active'] = in_array($v, ['actif', 'active', '1', 'true', 'oui'], true);
        }
    }

    public function setPriceCfaAttribute($value): void
    {
        if ($value === null || $value === '') {
            $this->attributes['price_cfa'] = 0;
            return;
        }
        $this->attributes['price_cfa'] = (int)$value;
    }

    public function setOrdersCountAttribute($value): void
    {
        if ($value === null || $value === '') {
            $this->attributes['orders_count'] = 0;
            return;
        }
        $this->attributes['orders_count'] = (int)$value;
    }

    public function setRatingAttribute($value): void
    {
        if ($value === null || $value === '') {
            $this->attributes['rating'] = null;
            return;
        }
        $f = (float)$value;
        if ($f < 0) $f = 0;
        if ($f > 5) $f = 5;
        // stocke en float, compatible cast + serializer
        $this->attributes['rating'] = $f;
    }

    public function setDurationDaysAttribute($value): void
    {
        if ($value === null) {
            $this->attributes['duration_days'] = null;
            return;
        }
        $this->attributes['duration_days'] = trim((string)$value);
    }

    public function setDocumentsAttribute($value): void
    {
        if (is_string($value)) {
            $parts = preg_split('/[\r\n,]+/', $value);
            $parts = array_values(array_filter(array_map('trim', $parts)));
            $this->attributes['documents'] = json_encode($parts, JSON_UNESCAPED_UNICODE);
            return;
        }
        if (is_array($value)) {
            $clean = array_values(array_filter(array_map('trim', $value)));
            $this->attributes['documents'] = json_encode($clean, JSON_UNESCAPED_UNICODE);
            return;
        }
        $this->attributes['documents'] = json_encode([], JSON_UNESCAPED_UNICODE);
    }
}
