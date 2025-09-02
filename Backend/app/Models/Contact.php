<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUSES = ['nouveau', 'en_cours', 'traite', 'clos', 'spam'];

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'subject',
        'message',
        'status',
        'assigned_to',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'is_read'   => 'bool',
        'read_at'   => 'datetime',
        'handled_at' => 'datetime',
    ];

    public function reader()
    {
        return $this->belongsTo(User::class, 'read_by');
    }
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function scopeStatus($q, ?string $status)
    {
        if ($status) $q->where('status', $status);
    }
    public function scopeUnread($q)
    {
        return $q->where('is_read', false);
    }
    public function scopeRead($q)
    {
        return $q->where('is_read', true);
    }
    public function scopeSearch($q, ?string $term)
    {
        if (!$term) return $q;
        $like = '%' . $term . '%';
        return $q->where(function ($w) use ($like) {
            $w->where('first_name', 'like', $like)
                ->orWhere('last_name', 'like', $like)
                ->orWhere('email', 'like', $like)
                ->orWhere('subject', 'like', $like)
                ->orWhere('message', 'like', $like);
        });
    }
}
