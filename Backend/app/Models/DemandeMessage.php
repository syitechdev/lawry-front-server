<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeMessage extends Model
{
    protected $fillable = ['demande_id', 'sender_id', 'sender_role', 'is_internal', 'body', 'read_at'];
    protected $casts = ['is_internal' => 'boolean', 'read_at' => 'datetime'];
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
