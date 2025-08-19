<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'formation_id',
        'user_id',
        'status',
        'amount_cfa',
        'price_type',
        'experience',
        'session_format',
        'read_at',

    ];

    protected $casts = [
        'amount_cfa'   => 'integer',
        'read_at'      => 'datetime',
    ];


    public function formation()
    {
        return $this->belongsTo(Formation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isUnread(): bool
    {
        return is_null($this->read_at);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForFormation($query, int $formationId)
    {
        return $query->where('formation_id', $formationId);
    }
}
