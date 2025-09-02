<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'period',
        'status',
        'current_cycle_start',
        'current_cycle_end',
        'last_payment_reference',
        'meta',
    ];

    protected $casts = [
        'current_cycle_start' => 'datetime',
        'current_cycle_end'   => 'datetime',
        'meta'                => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
    public function plan()
    {
        return $this->belongsTo(\App\Models\Plan::class);
    }
}
