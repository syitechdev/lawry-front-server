<?php

namespace App\Contracts;

use App\Models\Payment;

interface PayableContract
{
    public function payableAmountXof(): int;

    public function payableLabel(): string;

    public function onPaymentSucceeded(Payment $payment): void;
}
