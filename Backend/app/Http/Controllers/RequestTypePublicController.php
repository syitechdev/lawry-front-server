<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RequestType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;


class RequestTypePublicController extends Controller
{
    public function showBySlug(string $slug): JsonResponse
    {
        $rt = RequestType::select('id', 'name', 'slug', 'currency', 'config', 'is_active')
            ->where('slug', $slug)
            ->where('is_active', 1)
            ->first();

        if (!$rt) {
            return response()->json(['message' => 'RequestType not found or inactive'], 404);
        }

        $rt->setAppends([]); // évite price_display, locked, etc.

        $config = $rt->config;

        if (is_string($config)) {
            $decoded = json_decode($config, true);
            $config = is_array($decoded) ? $decoded : [];
        }
        if (!is_array($config)) {
            $config = [];
        }

        $cards = [];
        if (isset($config['variant_cards']) && is_array($config['variant_cards'])) {
            foreach ($config['variant_cards'] as $c) {
                if (!is_array($c)) continue;
                $isActive = array_key_exists('active', $c) ? (bool)$c['active'] : true;
                if ($isActive) {
                    $cards[] = [
                        'key'           => (string)($c['key'] ?? ''),
                        'title'         => (string)($c['title'] ?? ''),
                        'subtitle'      => $c['subtitle'] ?? null,
                        'pill'          => isset($c['pill']) ? (string)$c['pill'] : null,
                        'pricing_mode'  => in_array(($c['pricing_mode'] ?? 'quote'), ['fixed', 'from', 'quote'], true)
                            ? $c['pricing_mode'] : 'quote',
                        'price_amount'  => is_numeric($c['price_amount'] ?? null) ? (float)$c['price_amount'] : null,
                        'currency'      => (string)($c['currency'] ?? ($rt->currency ?? 'XOF')),
                        'features'      => array_values(array_filter(array_map('strval', (array)($c['features'] ?? [])))),
                        'cta'           => $c['cta'] ?? null,
                        'active'        => true,
                        'meta'          => isset($c['meta']) && is_array($c['meta']) ? $c['meta'] : (isset($c['preset']) ? (array)$c['preset'] : []),
                    ];
                }
            }
        }

        $payload = [
            'id'       => $rt->id,
            'name'     => $rt->name,
            'slug'     => $rt->slug,
            'currency' => $rt->currency ?? 'XOF',
            'config'   => [
                'variant_cards' => $cards,
                'order'         => isset($config['order']) && is_array($config['order']) ? $config['order'] : [],
            ],
        ];

        return response()->json($payload);
    }
}
