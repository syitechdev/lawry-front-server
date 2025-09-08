<?php

namespace App\Mail;

use App\Models\Purchase;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PurchaseServiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Purchase $purchase) {}

    public function build()
    {
        return $this->subject('Votre commande — ' . $this->purchase->product_snapshot['name'])
            ->view('emails.purchases.service', [
                'purchase' => $this->purchase,
            ]);
    }
}
