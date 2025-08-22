<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeEvent extends Model
{
    protected $fillable = ['demande_id', 'event', 'payload', 'actor_id', 'actor_name'];
    protected $casts = ['payload' => 'array'];
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }
    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
