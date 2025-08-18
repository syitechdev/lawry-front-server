<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    protected $fillable = [
        'user_id',
        'guest',
        'preferences',
        'total_price',
        'payment_required',
        'status',
    ];

    protected $casts = [
        'guest' => 'array',
        'preferences' => 'array',
        'payment_required' => 'boolean',
        'total_price' => 'integer',
    ];

    public function items()
    {
        return $this->hasMany(RegistrationItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
