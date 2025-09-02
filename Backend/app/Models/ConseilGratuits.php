<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConseilGratuit extends Model
{
    use HasFactory;

    protected $table = 'conseil_gratuits';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'legal_domain',
        'description',
        'urgency',
        'consent',
        'status',
        'is_read',
        'read_at',
        'read_by',
    ];

    protected $casts = [
        'consent' => 'boolean',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function scopeSearch($q, ?string $term)
    {
        $t = trim((string)$term);
        if ($t === '') return $q;
        return $q->where(function ($qq) use ($t) {
            $qq->where('first_name', 'like', "%$t%")
                ->orWhere('last_name', 'like', "%$t%")
                ->orWhere('email', 'like', "%$t%")
                ->orWhere('phone', 'like', "%$t%")
                ->orWhere('legal_domain', 'like', "%$t%")
                ->orWhere('description', 'like', "%$t%")
                ->orWhere('status', 'like', "%$t%");
        });
    }

    public function scopeStatus($q, $status)
    {
        if ($status === null || $status === '') return $q;
        return $q->where('status', $status);
    }
}
