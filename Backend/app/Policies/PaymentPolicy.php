<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function view(User $user, Payment $payment): bool
    {
        if ($payment->customer_email && $payment->customer_email === $user->email) {
            return true;
        }
        if (is_array($payment->meta) && isset($payment->meta['user_id']) && (int)$payment->meta['user_id'] === (int)$user->id) {
            return true;
        }
        return false;
    }
}
