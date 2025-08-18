<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationItem extends Model
{
    protected $fillable = [
        'registration_id',
        'formation_id',
        'price_cfa',
    ];

    protected $casts = [
        'price_cfa' => 'integer',
    ];

    public function registration()
    {
        return $this->belongsTo(Registration::class);
    }

    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }
}
