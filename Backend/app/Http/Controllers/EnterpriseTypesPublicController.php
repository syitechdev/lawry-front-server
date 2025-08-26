<?php

namespace App\Http\Controllers;

use App\Models\EnterpriseType;
use App\Models\EnterpriseTypeOffer;
use Illuminate\Http\Request;

class EnterpriseTypesPublicController extends Controller
{

    public function list(Request $request)
    {
        $q = EnterpriseType::query()
            ->orderBy('sigle');

        if ($s = trim((string) $request->input('q'))) {
            $q->where(function ($qq) use ($s) {
                $qq->where('sigle', 'like', "%{$s}%")
                    ->orWhere('signification', 'like', "%{$s}%");
            });
        }

        $items = $q->get()->map(function (EnterpriseType $t) {
            return [
                'id'             => $t->id,
                'sigle'          => $t->sigle,
                'signification'  => $t->signification,
                'description'    => $t->description,
            ];
        });

        return response()->json(['items' => $items]);
    }


    public function show(string $sigle)
    {
        $t = EnterpriseType::where('sigle', mb_strtoupper(trim($sigle)))->firstOrFail();

        return response()->json([
            'id'            => $t->id,
            'sigle'         => $t->sigle,
            'signification' => $t->signification,
            'description'   => $t->description,
        ]);
    }

    public function offers(string $sigle)
    {
        $t = EnterpriseType::where('sigle', mb_strtoupper(trim($sigle)))->firstOrFail();

        $offers = EnterpriseTypeOffer::where('enterprise_type_id', $t->id)
            ->where('is_active', true)
            ->orderBy('sort_index')
            ->orderBy('id')
            ->get();

        $list = $offers->map(function (EnterpriseTypeOffer $o) {
            $priceAmount = $o->price_amount_abidjan ?? $o->price_amount_interior ?? null;
            $currency = $o->currency ?: 'XOF';

            return [
                'id'                      => $o->id,
                'enterprise_type_id'      => $o->enterprise_type_id,
                'key'                     => $o->key,
                'title'                   => $o->title,
                'subtitle'                => $o->subtitle,
                'is_active'               => (bool) $o->is_active,
                'pricing_mode'            => $o->pricing_mode, // fixed | from | quote
                'price_amount_abidjan'    => $o->price_amount_abidjan,
                'price_amount_interior'   => $o->price_amount_interior,
                'currency'                => $currency,
                'features'                => array_values($o->features_json ?? []),
                'delivery'                => [
                    'min_days' => $o->delivery_min_days,
                    'max_days' => $o->delivery_max_days,
                ],
                'pill'                    => $o->pill,
                'cta'                     => $o->cta,
                'sort_index'              => $o->sort_index,
                'meta'                    => $o->meta ?? [],
                'price_display_abidjan'   => $this->displayPrice($o->pricing_mode, $o->price_amount_abidjan, $currency),
                'price_display_interior'  => $this->displayPrice($o->pricing_mode, $o->price_amount_interior, $currency),
            ];
        })->values();

        $variantCards = $list->map(function ($o) {
            return [
                'key'          => $o['key'],
                'title'        => $o['title'],
                'subtitle'     => $o['subtitle'],
                'pricing_mode' => $o['pricing_mode'],
                'price_amount' => $o['price_amount_abidjan'] ?? $o['price_amount_interior'] ?? null, // fallback
                'currency'     => $o['currency'],
                'features'     => $o['features'],
                'active'       => $o['is_active'],
                'pill'         => $o['pill'],
                'cta'          => $o['cta'],
                'meta'         => [
                    'abidjan'   => [
                        'amount' => $o['price_amount_abidjan'],
                        'display' => $o['price_display_abidjan'],
                    ],
                    'interior'  => [
                        'amount' => $o['price_amount_interior'],
                        'display' => $o['price_display_interior'],
                    ],
                ],
            ];
        })->values();

        return response()->json([
            'enterprise_type' => [
                'id'            => $t->id,
                'sigle'         => $t->sigle,
                'signification' => $t->signification,
                'description'   => $t->description,
            ],
            'offers'        => $list,
            'variant_cards' => $variantCards,
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
