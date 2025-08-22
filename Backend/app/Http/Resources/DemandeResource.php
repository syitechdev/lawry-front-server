<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

class DemandeResource extends JsonResource
{
    public function toArray($request): array
    {
        $service   = null;
        $rt        = null;
        $typeName  = $this->type_slug;
        $variant   = null;

        if ($this->type_slug) {
            $rt = \App\Models\RequestType::where('slug', $this->type_slug)->first();

            if ($rt) {
                $service = Arr::except($rt->toArray(), [
                    'id',
                    'version',
                    'is_active',
                    'config',
                    'created_at',
                    'updated_at'
                ]);

                $typeName = $this->meta['type_name'] ?? ($rt->name ?? $this->type_slug);

                $vk = $this->variant_key
                    ?? Arr::get($this->data, 'variant_key');

                if ($vk) {
                    $variant = $this->resolveVariantFromRequestType($rt, (string) $vk);
                }
            }
        }

        return [
            'ref'    => $this->ref,

            'type'   => [
                'slug'    => $this->type_slug,
                'version' => $this->type_version,
                'name'    => $typeName,

                'variant' => $variant,
            ],

            'service'      => $service,

            'status'       => $this->status,
            'priority'     => $this->priority,
            'is_read'      => $this->is_read,
            'currency'     => $this->currency,
            'paid_status'  => $this->paid_status,
            'paid_amount'  => $this->paid_amount,
            'data'         => $this->data,
            'meta'         => $this->meta,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'created_at'   => $this->created_at?->toIso8601String(),

            'files' => $this->whenLoaded('files', fn() => $this->files->map(fn($f) => [
                'id'           => $f->id,
                'tag'          => $f->tag,
                'name'         => $f->original_name,
                'size'         => $f->size,
                'mime'         => $f->mime,
                'created_at'   => $f->created_at?->toIso8601String(),
                'storage_path' => "storage/{$f->path}",
                'view_url'     => route('demandes.files.view', ['demande' => $this->ref, 'file' => $f->id]),
            ])),

            'messages' => $this->whenLoaded('messages', fn() => $this->messages->map(fn($m) => [
                'id'          => $m->id,
                'auteur'      => $m->sender?->name ?? ($m->sender_role === 'client' ? 'Client' : 'Staff'),
                'sender_role' => $m->sender_role,
                'is_internal' => $m->is_internal,
                'body'        => $m->body,
                'date'        => $m->created_at?->toIso8601String(),
            ])),

            'author'   => $this->whenLoaded('author', fn() => [
                'id'    => $this->author?->id,
                'name'  => $this->author?->name,
                'email' => $this->author?->email,
            ]),
            'assignee' => $this->whenLoaded('assignee', fn() => [
                'id'    => $this->assignee?->id,
                'name'  => $this->assignee?->name,
                'email' => $this->assignee?->email,
            ]),

            'events' => $this->whenLoaded('events', fn() => $this->events->map(fn($e) => [
                'id'         => $e->id,
                'event'      => $e->event,
                'payload'    => $e->payload,
                'actor'      => ['id' => $e->actor_id, 'name' => $e->actor_name],
                'created_at' => $e->created_at?->toIso8601String(),
            ])),
        ];
    }

    /**
     * Construit un tableau "variant" lisible à partir de la config du RequestType.
     * Priorité: config.variant_cards -> config.variants -> (fallback minimal).
     */
    private function resolveVariantFromRequestType(\App\Models\RequestType $rt, string $key): ?array
    {
        $cards = Arr::get($rt->config, 'variant_cards', []);
        if (is_array($cards) && !empty($cards)) {
            $found = collect($cards)->firstWhere('key', $key);
            if ($found) {
                $mode     = (string) Arr::get($found, 'pricing_mode', 'quote');
                $amount   = Arr::get($found, 'price_amount');
                $currency = (string) (Arr::get($found, 'currency', $rt->currency ?? 'XOF'));
                return [
                    'key'       => $key,
                    'title'     => (string) Arr::get($found, 'title', $key),
                    'subtitle'  => Arr::get($found, 'subtitle'),
                    'features'  => array_values(array_filter((array) Arr::get($found, 'features', []))),
                    'active'    => (bool) Arr::get($found, 'active', true),
                    'pill'      => Arr::get($found, 'pill'),
                    'price'     => [
                        'mode'     => $mode,
                        'amount'   => is_numeric($amount) ? (float) $amount : null,
                        'currency' => $currency,
                        'display'  => $this->displayPrice($mode, $amount, $currency),
                    ],
                    'cta'       => Arr::get($found, 'cta'),
                ];
            }
        }

        $variants = Arr::get($rt->config, 'variants', []);
        if (is_array($variants) && !empty($variants)) {
            $found = collect($variants)->firstWhere('key', $key);
            if ($found) {
                $mode     = (string) Arr::get($found, 'pricing_mode', 'quote');
                $amount   = Arr::get($found, 'price_amount');
                $currency = (string) (Arr::get($found, 'currency', $rt->currency ?? 'XOF'));

                return [
                    'key'       => $key,
                    'title'     => (string) (Arr::get($found, 'label') ?? Arr::get($found, 'title', $key)),
                    'subtitle'  => Arr::get($found, 'subtitle'),
                    'features'  => array_values(array_filter((array) Arr::get($found, 'features', []))),
                    'active'    => (bool) Arr::get($found, 'active', true),
                    'pill'      => Arr::get($found, 'pill'),
                    'price'     => [
                        'mode'     => $mode,
                        'amount'   => is_numeric($amount) ? (float) $amount : null,
                        'currency' => $currency,
                        'display'  => $this->displayPrice($mode, $amount, $currency),
                    ],
                ];
            }
        }

        return [
            'key'      => $key,
            'title'    => $key,
            'features' => [],
            'active'   => true,
            'pill'     => Arr::get($found, 'pill'),
            'price'    => [
                'mode'     => 'quote',
                'amount'   => null,
                'currency' => (string) ($rt->currency ?? 'XOF'),
                'display'  => 'Sur devis',
            ],
        ];
    }

    private function displayPrice(?string $mode, $amount, ?string $currency): string
    {
        $mode     = $mode ?: 'quote';
        $currency = $currency ?: 'XOF';

        if ($mode === 'quote' || !$amount) {
            return 'Sur devis';
        }

        $formatted = number_format((float) $amount, 0, ',', ' ');
        return $mode === 'from'
            ? "À partir de {$formatted} {$currency}"
            : "{$formatted} {$currency}";
    }
}
