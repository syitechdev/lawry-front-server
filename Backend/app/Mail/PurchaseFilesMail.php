<?php

namespace App\Mail;

use App\Models\Purchase;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class PurchaseFilesMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Purchase $purchase) {}

    public function build()
    {
        $mail = $this->subject('Vos fichiers — ' . $this->purchase->product_snapshot['name'])
            ->view('emails.purchases.files', ['purchase' => $this->purchase]);

        $paths = (array)($this->purchase->product_snapshot['files'] ?? []);

        if (empty($paths)) {
            $urls = (array)($this->purchase->product_snapshot['files_urls'] ?? []);
            foreach ($urls as $u) {
                $rel = ltrim(str_replace('/storage/', '', parse_url($u, PHP_URL_PATH) ?? ''), '/');
                if ($rel !== '') $paths[] = $rel;
            }
        }

        foreach ($paths as $rel) {
            try {
                if ($rel && Storage::disk('public')->exists($rel)) {
                    $mail->attach(Storage::disk('public')->path($rel));
                }
            } catch (\Throwable $e) {
                report($e); // on continue même si un fichier manque
            }
        }

        return $mail;
    }
}
