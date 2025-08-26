<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RequestType;
use App\Models\EnterpriseType;
use App\Models\EnterpriseTypeOffer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RequestTypePublicController extends Controller
{
    public function showBySlug(Request $request, string $slug): JsonResponse
    {
        // 1) On récupère le RequestType actif minimal (comme tu faisais)
        $rt = RequestType::select('id', 'name', 'slug', 'currency', 'config', 'is_active')
            ->where('slug', $slug)
            ->where('is_active', 1)
            ->first();

        if (!$rt) {
            return response()->json(['message' => 'RequestType not found or inactive'], 404);
        }

        $rt->setAppends([]); // évite price_display, locked, etc.

        // Décodage config robuste
        $config = $rt->config;
        if (is_string($config)) {
            $decoded = json_decode($config, true);
            $config = is_array($decoded) ? $decoded : [];
        }
        if (!is_array($config)) $config = [];

        // 2) CAS STANDARD (tous les slugs sauf "creer-entreprise")
        //    -> on renvoie exactement ce que tu faisais : variant_cards filtrés sur active = true
        $cards = [];
        if ($slug !== 'creer-entreprise') {
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

            return response()->json([
                'id'       => $rt->id,
                'name'     => $rt->name,
                'slug'     => $rt->slug,
                'currency' => $rt->currency ?? 'XOF',
                'config'   => [
                    'variant_cards' => $cards,
                    'order'         => isset($config['order']) && is_array($config['order']) ? $config['order'] : [],
                ],
            ]);
        }

        // 3) CAS SPÉCIAL "creer-entreprise"
        //    - Si aucun sigle fourni, on renvoie la config telle quelle (comme avant).
        //    - Si ?sigle= fourni, on projette les offres publiées (EnterpriseTypeOffer) en variant_cards.
        $sigle = strtoupper(trim((string) $request->query('sigle', '')));
        if ($sigle === '') {
            // comportement inchangé (aucun sigle => on sert ta config existante)
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

            return response()->json([
                'id'       => $rt->id,
                'name'     => $rt->name,
                'slug'     => $rt->slug,
                'currency' => $rt->currency ?? 'XOF',
                'config'   => [
                    'variant_cards' => $cards,
                    'order'         => isset($config['order']) && is_array($config['order']) ? $config['order'] : [],
                ],
            ]);
        }

        // 3.bis) ?sigle= fourni -> on charge les offres publiées et on mappe
        $type = EnterpriseType::where('sigle', $sigle)->first();
        if (!$type) {
            return response()->json(['message' => 'Enterprise type not found'], 404);
        }

        $offers = EnterpriseTypeOffer::where('enterprise_type_id', $type->id)
            ->where('is_active', true)
            ->orderBy('sort_index')
            ->orderBy('id')
            ->get();

        $cards = $offers->map(function (EnterpriseTypeOffer $o) use ($rt) {
            $currency = $o->currency ?: ($rt->currency ?? 'XOF');
            $pmode    = in_array($o->pricing_mode, ['fixed', 'from', 'quote'], true) ? $o->pricing_mode : 'quote';

            // Fallback price_amount = Abidjan (compatible avec le front existant)
            $fallbackAmount = $o->price_amount_abidjan ?? $o->price_amount_interior ?? null;

            return [
                'key'           => (string) $o->key,
                'title'         => (string) $o->title,
                'subtitle'      => $o->subtitle,
                'pill'          => $o->pill,
                'pricing_mode'  => $pmode,               // fixed | from | quote
                'price_amount'  => is_numeric($fallbackAmount) ? (float)$fallbackAmount : null,
                'currency'      => $currency,
                'features'      => array_values($o->features_json ?? []),
                'cta'           => $o->cta,
                'active'        => true,
                // On expose les 2 tarifs dans meta pour les besoins d’affichage:
                'meta'          => [
                    'abidjan'  => [
                        'amount'  => $o->price_amount_abidjan,
                        'display' => $this->displayPrice($pmode, $o->price_amount_abidjan, $currency),
                    ],
                    'interior' => [
                        'amount'  => $o->price_amount_interior,
                        'display' => $this->displayPrice($pmode, $o->price_amount_interior, $currency),
                    ],
                    'delivery' => [
                        'min_days' => $o->delivery_min_days,
                        'max_days' => $o->delivery_max_days,
                    ],
                ],
            ];
        })->values()->all();

        return response()->json([
            'id'       => $rt->id,
            'name'     => $rt->name,
            'slug'     => $rt->slug,
            'currency' => $rt->currency ?? 'XOF',
            'config'   => [
                'variant_cards' => $cards,
                'order'         => [],
                'enterprise'    => [
                    'sigle'          => $type->sigle,
                    'signification'  => $type->signification,
                ],
            ],
        ]);
    }

    private function displayPrice(?string $mode, $amount, ?string $currency): string
    {
        $mode     = $mode ?: 'quote';
        $currency = $currency ?: 'XOF';
        if ($mode === 'quote' || !$amount) return 'Sur devis';

        $formatted = number_format((float) $amount, 0, ',', ' ');
        return $mode === 'from'
            ? "À partir de {$formatted} {$currency}"
            : "{$formatted} {$currency}";
    }
}
