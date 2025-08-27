<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Payment extends Model
{
    use HasFactory;

    public const S_PENDING   = 'pending';
    public const S_INITIATED = 'initiated';
    public const S_PROCESS   = 'processing';
    public const S_OK        = 'succeeded';
    public const S_FAIL      = 'failed';
    public const S_CANCEL    = 'cancelled';
    public const S_EXPIRE    = 'expired';

    protected $fillable = [
        'payable_type',
        'payable_id',
        'reference',
        'provider',
        'session_id',
        'amount',
        'currency',
        'channel',
        'customer_email',
        'customer_first_name',
        'customer_last_name',
        'customer_phone',
        'status',
        'response_code',
        'response_message',
        'initialized_at',
        'paid_at',
        'cancelled_at',
        'expires_at',
        'meta',
    ];

    protected $casts = [
        'initialized_at' => 'datetime',
        'paid_at'        => 'datetime',
        'cancelled_at'   => 'datetime',
        'expires_at'     => 'datetime',
        'meta'           => 'array',
    ];

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function markInitiated(string $sessionId): void
    {
        $this->forceFill([
            'session_id'     => $sessionId,
            'status'         => self::S_INITIATED,
            'initialized_at' => now(),
            'expires_at'     => now()->addMinutes(5),
        ])->save();
    }

    public function markSucceeded(?string $code = null, ?string $message = null): void
    {
        $this->forceFill([
            'status'           => self::S_OK,
            'response_code'    => $code,
            'response_message' => $message,
            'paid_at'          => now(),
        ])->save();
    }

    public function markFailed(?string $code = null, ?string $message = null): void
    {
        $this->forceFill([
            'status'           => self::S_FAIL,
            'response_code'    => $code,
            'response_message' => $message,
        ])->save();
    }
}
