<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Str;

class PaymentInvoiceData
{
    public function build(Payment $p): array
    {
        $payable = $p->payable;
        $cls     = $p->payable_type;

        $product = [
            'type'   => $this->morphAlias($cls),
            'title'  => '',
            'details' => [],
        ];

        switch ($cls) {
            case Relation::getMorphedModel('demande'):
            case 'App\Models\Demande':
                $typeSlug     = (string)($payable->type_slug ?? '');
                $produitSlug  = (string)($payable->produit_slug ?? $payable->variant_key ?? '');
                $product['title']            = $this->sentenceFromSlug($typeSlug);
                $product['details']['produit'] = $this->sentenceFromSlug($produitSlug);
                break;

            case Relation::getMorphedModel('subscription'):
            case 'App\Models\Subscription':
                $slug = (string)($payable->slug ?? '');
                $product['title']              = $slug;
                $product['details']['plan']    = $this->sentenceFromSlug(preg_replace('/-\d+$/', '', $slug) ?? '');
                $product['details']['description'] = (string)($payable->description ?? 'Facturation mensuelle');
                break;

            case Relation::getMorphedModel('formation'):
            case 'App\Models\Formation':
                $product['title']                 = (string)($payable->title ?? 'Formation');
                $product['details']['level']      = (string)($payable->level ?? '');
                $product['details']['description'] = (string)($payable->description ?? '');
                $product['details']['type']       = (string)($payable->type ?? '');
                $product['details']['duration']   = (string)($payable->duration ?? '');
                $modules = $payable->modules ?? $payable->module ?? [];
                $product['details']['modules']    = is_array($modules) ? $modules : [];
                break;

            case Relation::getMorphedModel('boutique'):
            case 'App\Models\Boutique':
                $product['title']                   = (string)($payable->name ?? 'Produit');
                $product['details']['type']         = (string)($payable->type ?? '');
                $product['details']['name']         = (string)($payable->name ?? '');
                $product['details']['description']  = (string)($payable->description ?? '');
                break;

            default:
                $product['title'] = method_exists($payable, 'payableLabel')
                    ? (string)$payable->payableLabel()
                    : ((string)($payable->title ?? $payable->name ?? 'Produit'));
        }

        $amount = (int)$p->amount;

        return [
            'reference' => $p->reference,
            'date'      => optional($p->paid_at)->toDateTimeString() ?? optional($p->created_at)->toDateTimeString(),
            'currency'  => $p->currency ?? 'XOF',
            'amount'    => $amount,
            'totals'    => [
                'subtotal' => $amount,
                'tax'      => 0,
                'total'    => $amount,
            ],
            'customer'  => [
                'name'  => trim(($p->customer_first_name ?? '') . ' ' . ($p->customer_last_name ?? '')),
                'email' => (string)$p->customer_email,
                'phone' => (string)$p->customer_phone,
            ],
            'company'   => config('company'),
            'product'   => $product,
            'status'    => $p->status,
        ];
    }

    private function sentenceFromSlug(?string $slug): string
    {
        $s = Str::of((string)$slug)->replace(['-', '_'], ' ')->lower()->trim();
        return $s->isEmpty() ? '' : ucfirst((string)$s);
    }

    private function morphAlias(string $cls): string
    {
        $map = array_flip(Relation::morphMap() ?? []);
        return $map[$cls] ?? Str::of(class_basename($cls))->lower();
    }
}
