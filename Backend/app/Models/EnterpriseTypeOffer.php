<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EnterpriseTypeOffer extends Model
{
    use HasFactory;

    protected $fillable = [
        'enterprise_type_id',
        'key',
        'title',
        'subtitle',
        'is_active',
        'pricing_mode',
        'price_amount_abidjan',
        'price_amount_interior',
        'currency',
        'features_json',
        'delivery_min_days',
        'delivery_max_days',
        'pill',
        'cta',
        'sort_index',
        'meta',
    ];

    protected $casts = [
        'is_active'             => 'boolean',
        'price_amount_abidjan'  => 'integer',
        'price_amount_interior' => 'integer',
        'delivery_min_days'     => 'integer',
        'delivery_max_days'     => 'integer',
        'sort_index'            => 'integer',
        'features_json'         => 'array',
        'meta'                  => 'array',
    ];

    protected $attributes = [
        'currency'     => 'XOF',
        'pricing_mode' => 'from',
    ];

    public function scopeForType($q, int $typeId)
    {
        return $q->where('enterprise_type_id', $typeId);
    }
    public function scopeOrdered($q)
    {
        return $q->orderBy('sort_index')->orderBy('id');
    }
    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public function enterpriseType()
    {
        return $this->belongsTo(EnterpriseType::class);
    }
}
