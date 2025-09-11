<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $fillable = [
        'ref',
        'user_id',
        'boutique_id',
        'status',
        'unit_price_cfa',
        'currency',
        'channel',
        'customer_snapshot',
        'product_snapshot',
        'delivered_at',
        'delivered_payload',
        'meta'
    ];

    protected $casts = [
        'customer_snapshot' => 'array',
        'product_snapshot'  => 'array',
        'delivered_at'      => 'datetime',
        'delivered_payload' => 'array',
        'meta'              => 'array',
    ];

    public static function nextRef(): string
    {
        $base = 'PUR-' . now()->format('Ymd') . '-';
        $seq  = (int) static::where('ref', 'like', $base . '%')->count() + 1;
        return $base . str_pad((string)$seq, 5, '0', STR_PAD_LEFT);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function boutique()
    {
        return $this->belongsTo(Boutique::class);
    }
}
