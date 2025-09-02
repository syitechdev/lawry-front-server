<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Contracts\PayableContract;
use App\Traits\IsPayable;
use App\Models\Payment;
use Illuminate\Support\Facades\Schema;

class Subscription extends Model implements PayableContract
{
    use HasFactory, IsPayable;

    protected $fillable = [
        'user_id',
        'plan_id',
        'period', //mois/année
        'status',
        'current_cycle_start',
        'current_cycle_end',
        'last_payment_reference',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'current_cycle_start' => 'datetime',
        'current_cycle_end'   => 'datetime',
    ];

    // relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function payments()
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function lastPayment()
    {
        return $this->morphOne(Payment::class, 'payable')->latestOfMany();
    }

    public function payableAmountXof(): int
    {
        if (!$this->plan) {
            throw new \RuntimeException("Pas de plan lié à la souscription #{$this->id}");
        }

        return $this->period === 'yearly'
            ? (int) $this->plan->yearly_price_cfa
            : (int) $this->plan->monthly_price_cfa;
    }

    public function payableLabel(): string
    {
        $planName = $this->plan?->name ?? 'Plan #' . $this->plan_id;
        return "Abonnement: {$planName} ({$this->period})";
    }

    public function onPaymentSucceeded(Payment $payment): void
    {
        $start = now();
        $end   = $this->period === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        $this->forceFill([
            'status'              => 'active',
            'current_cycle_start' => $start,
            'current_cycle_end'   => $end,
            'last_payment_reference' => $payment->reference,
        ])->save();
    }


    public function isActive(): bool
    {
        return $this->status === 'active'
            && $this->current_cycle_end
            && $this->current_cycle_end->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->status === 'active'
            && $this->current_cycle_end
            && $this->current_cycle_end->isPast();
    }

    public function scopeActive($q)
    {
        return $q->where('status', 'active')
            ->where('current_cycle_end', '>=', now());
    }

    public function scopeExpired($q)
    {
        return $q->where('status', 'active')
            ->where('current_cycle_end', '<', now());
    }
}
