<?php

namespace App\Jobs;

use App\Models\Purchase;
use App\Mail\PurchaseFilesMail;
use App\Mail\PurchaseServiceMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class DeliverPurchase implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $purchaseId) {}

    public function handle(): void
    {
        $p = Purchase::with('user', 'boutique')->find($this->purchaseId);
        if (!$p || $p->status !== 'paid') return;

        $type  = $p->product_snapshot['type'] ?? $p->boutique->type ?? 'service';
        $email = $p->user->email;

        if ($type === 'file') {
            $relPaths = (array)($p->product_snapshot['files'] ?? []);

            if (empty($relPaths)) {
                $urls = (array)($p->product_snapshot['files_urls'] ?? []);
                foreach ($urls as $u) {

                    $path = parse_url($u, PHP_URL_PATH) ?: '';
                    if ($path && str_starts_with($path, '/storage/')) {
                        $rel = ltrim(substr($path, strlen('/storage/')), '/');
                        if ($rel !== '') $relPaths[] = $rel;
                    }
                }
            }

            $attachments = [];
            $total = 0;
            foreach ($relPaths as $rel) {
                if (!is_string($rel) || $rel === '') continue;
                if (preg_match('#^https?://#i', $rel)) continue;

                $abs = Storage::disk('public')->path($rel);
                if (!is_file($abs)) continue;

                $size = @filesize($abs) ?: 0;
                if ($total + $size <= 18 * 1024 * 1024) {
                    $attachments[] = $abs;
                    $total += $size;
                }
            }

            Mail::to($email)->send(new PurchaseFilesMail($p, $attachments));

            $p->forceFill([
                'delivered_at'      => now(),
                'delivered_payload' => [
                    'mode'        => 'attachments',
                    'attachments' => array_map('basename', $attachments),
                    'links'       => [], // jamais de liens exposés
                ],
            ])->save();
        } else {
            Mail::to($email)->send(new PurchaseServiceMail($p));
            $p->forceFill([
                'delivered_at'      => now(),
                'delivered_payload' => ['mode' => 'service_mail'],
            ])->save();
        }
    }
}
