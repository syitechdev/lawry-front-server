<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Contracts\PayableContract;
use App\Traits\IsPayable;
use App\Models\Payment;

class Demande extends Model implements PayableContract
{
    use IsPayable;

    protected $fillable = [
        'ref',
        'type_slug',
        'type_version',
        'variant_key',
        'status',
        'priority',
        'is_read',
        'assigned_to',
        'created_by',
        'paid_status',
        'payment_status',
        'paid_amount',
        'currency',
        'data',
        'meta',
        'submitted_at',
    ];

    protected $casts = [
        'is_read'      => 'boolean',
        'data'         => 'array',
        'meta'         => 'array',
        'submitted_at' => 'datetime',
        'paid_amount'  => 'float',
    ];

    protected $attributes = [
        'is_read'     => false,
        'status'      => 'reçu',
        'priority'    => 'normal',
        'paid_status' => 'unpaid',
        'currency'    => 'XOF',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $d) {
            if (empty($d->ref)) {
                $d->ref = self::newRef();
            }
            if (empty($d->submitted_at)) {
                $d->submitted_at = now();
            }
        });
    }

    public static function newRef(): string
    {
        $year = now()->year;
        $seq  = str_pad(
            (string) (self::whereYear('created_at', $year)->count() + 1),
            6,
            '0',
            STR_PAD_LEFT
        );
        return "DEM-{$year}-{$seq}";
    }

    public function author()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function assignee()
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_to');
    }

    public function type()
    {
        return $this->belongsTo(\App\Models\RequestType::class, 'type_slug', 'slug');
    }

    public function scopeOfVariant($q, string $variant)
    {
        return $q->where('variant_key', $variant);
    }

    public function events()
    {
        return $this->hasMany(\App\Models\DemandeEvent::class)->latest('id');
    }

    public function files()
    {
        return $this->hasMany(\App\Models\DemandeFile::class);
    }

    public function messages()
    {
        return $this->hasMany(\App\Models\DemandeMessage::class)->latest('id');
    }

    public function scopeOfType($q, string $slug)
    {
        return $q->where('type_slug', $slug);
    }

    public function scopeUnread($q)
    {
        return $q->where('is_read', false);
    }

    public function payableLabel(): string
    {
        $ref = $this->ref ?: ('#' . $this->getKey());
        return "Demande: {$ref} ({$this->type_slug})";
    }

    public function payableAmountXof(): int
    {
        $d = $this->data ?? [];
        foreach (['amount', 'price_cfa', 'montant', 'total_amount', 'total'] as $k) {
            $v = data_get($d, $k);
            if (is_numeric($v)) {
                return (int) round((float) $v);
            }
        }
        if (is_numeric($this->paid_amount) && (float) $this->paid_amount > 0) {
            return (int) round((float) $this->paid_amount);
        }
        throw new \RuntimeException("Aucun montant trouvé pour Demande {$this->ref}.");
    }

    public function onPaymentPending(Payment $payment): void
    {
        $this->forceFill([
            'paid_status'    => 'paiement en attente',
            'payment_status' => 'paiement en attente',
            'currency'       => $this->currency ?: ($payment->currency ?: 'XOF'),
        ])->save();
    }

    public function onPaymentSucceeded(Payment $payment): void
    {
        $this->forceFill([
            'paid_status'    => 'paiement confirmé',
            'payment_status' => 'paiement confirmé',
            'paid_amount'    => (float) $payment->amount,
            'currency'       => $payment->currency ?: ($this->currency ?? 'XOF'),
        ])->save();
    }

    public function onPaymentFailed(Payment $payment): void
    {
        $this->forceFill([
            'paid_status'    => 'paiement échoué',
            'payment_status' => 'paiement échoué',
        ])->save();
    }
}
