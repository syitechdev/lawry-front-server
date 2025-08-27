<?php

namespace App\Traits;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Schema;


trait IsPayable
{
    protected string $payableAmountAttribute = 'price';

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function payableLabel(): string
    {
        return ucfirst(class_basename($this)) . ' #' . $this->getKey();
    }

    public function payableAmountXof(): int
    {
        $attr = property_exists($this, 'payableAmountAttribute')
            ? $this->payableAmountAttribute
            : 'price';

        $candidates = array_unique([$attr, 'price', 'amount', 'total_amount', 'total', 'montant']);
        foreach ($candidates as $name) {
            $v = $this->getAttribute($name);
            if ($v !== null) {
                return (int) $v;
            }
        }

        throw new \RuntimeException(sprintf(
            'Définis $payableAmountAttribute ou implémente payableAmountXof() dans %s.',
            static::class
        ));
    }

    public function onPaymentSucceeded(Payment $payment): void
    {
        $dirty = [];
        if (Schema::hasColumn($this->getTable(), 'payment_status')) {
            $dirty['payment_status'] = 'paid';
        }
        if (Schema::hasColumn($this->getTable(), 'paid_at')) {
            $dirty['paid_at'] = now();
        }
        if ($dirty) {
            $this->forceFill($dirty)->save();
        }
    }

    protected function defaultOnPaymentSucceeded(Payment $payment): void
    {
        $this->onPaymentSucceeded($payment);
    }
}
