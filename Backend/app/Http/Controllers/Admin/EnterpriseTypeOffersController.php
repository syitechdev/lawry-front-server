<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnterpriseType;
use App\Models\EnterpriseTypeOffer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EnterpriseTypeOffersController extends Controller
{
    public function index($id)
    {
        $type = EnterpriseType::findOrFail((int) $id);

        $items = EnterpriseTypeOffer::where('enterprise_type_id', $type->id)
            ->orderBy('sort_index')
            ->orderBy('id')
            ->get()
            ->map(fn(EnterpriseTypeOffer $o) => $this->serializeOffer($o))
            ->values();

        return response()->json([
            'enterprise_type' => [
                'id'            => $type->id,
                'sigle'         => $type->sigle,
                'signification' => $type->signification,
            ],
            'items' => $items,
        ]);
    }

    public function store(Request $request, $id)
    {
        $type = EnterpriseType::findOrFail((int) $id);
        $data = $this->validatePayload($request, $type->id, null);

        $maxSort = EnterpriseTypeOffer::where('enterprise_type_id', $type->id)->max('sort_index');
        $data['sort_index'] = is_numeric($maxSort) ? ((int)$maxSort + 1) : 0;

        $offer = EnterpriseTypeOffer::create(array_merge($data, [
            'enterprise_type_id' => $type->id,
        ]));

        return response()->json($this->serializeOffer($offer->fresh()), 201);
    }

    public function update(Request $request, EnterpriseTypeOffer $offer)
    {
        $data = $this->validatePayload($request, $offer->enterprise_type_id, $offer->id, true);

        if (array_key_exists('meta', $data)) {
            $currentMeta = is_array($offer->meta) ? $offer->meta : [];
            $data['meta'] = array_replace_recursive($currentMeta, (array) $data['meta']);
        }

        $offer->update($data);

        return response()->json($this->serializeOffer($offer->fresh()));
    }

    public function destroy(EnterpriseTypeOffer $offer)
    {
        $offer->delete();
        return response()->json(['ok' => true]);
    }

    public function publish(EnterpriseTypeOffer $offer)
    {
        $offer->is_active = true;
        $offer->save();

        return response()->json(['ok' => true, 'offer' => $this->serializeOffer($offer)]);
    }

    public function unpublish(EnterpriseTypeOffer $offer)
    {
        $offer->is_active = false;
        $offer->save();

        return response()->json(['ok' => true, 'offer' => $this->serializeOffer($offer)]);
    }

    public function reorder(Request $request, $id)
    {
        $type = EnterpriseType::findOrFail((int) $id);

        $payload = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', Rule::exists('enterprise_type_offers', 'id')->where(function ($q) use ($type) {
                $q->where('enterprise_type_id', $type->id);
            })],
            'items.*.sort_index' => ['required', 'integer'],
        ]);

        foreach ($payload['items'] as $row) {
            EnterpriseTypeOffer::where('id', (int) $row['id'])
                ->where('enterprise_type_id', $type->id)
                ->update(['sort_index' => (int) $row['sort_index']]);
        }

        $items = EnterpriseTypeOffer::where('enterprise_type_id', $type->id)
            ->orderBy('sort_index')
            ->orderBy('id')
            ->get()
            ->map(fn(EnterpriseTypeOffer $o) => $this->serializeOffer($o))
            ->values();

        return response()->json(['ok' => true, 'items' => $items]);
    }

    private function validatePayload(Request $request, int $enterpriseTypeId, ?int $offerId = null, bool $partial = false): array
    {
        $rules = [
            'key'                   => [
                $partial ? 'sometimes' : 'required',
                'string',
                'max:60',
                Rule::unique('enterprise_type_offers', 'key')
                    ->ignore($offerId)
                    ->where(fn($q) => $q->where('enterprise_type_id', $enterpriseTypeId)),
            ],
            'title'                 => [$partial ? 'sometimes' : 'required', 'string', 'max:120'],
            'subtitle'              => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_active'             => ['sometimes', 'boolean'],
            'pricing_mode'          => [$partial ? 'sometimes' : 'required', Rule::in(['fixed', 'from', 'quote'])],
            'price_amount_abidjan'  => ['sometimes', 'nullable', 'numeric'],
            'price_amount_interior' => ['sometimes', 'nullable', 'numeric'],
            'currency'              => ['sometimes', 'nullable', 'string', 'max:10'],
            'features'              => ['sometimes', 'array'],
            'features.*'            => ['string', 'max:200'],
            'features_json'         => ['sometimes', 'array'],
            'features_json.*'       => ['string', 'max:200'],
            'delivery_min_days'     => ['sometimes', 'nullable', 'integer', 'min:0'],
            'delivery_max_days'     => ['sometimes', 'nullable', 'integer', 'min:0'],
            'pill'                  => ['sometimes', 'nullable', 'string', 'max:40'],
            'cta'                   => ['sometimes', 'nullable', 'string', 'max:80'],
            'sort_index'            => ['sometimes', 'integer'],
            'meta'                                   => ['sometimes', 'array'],
            'meta.options_with_price'                => ['sometimes', 'array'],
            'meta.options_with_price.*.label'        => ['required', 'string', 'max:120'],
            'meta.options_with_price.*.price_text'   => ['nullable', 'string', 'max:120'],
        ];

        $data = $request->validate($rules);

        if (array_key_exists('currency', $data) && !$data['currency']) {
            $data['currency'] = 'XOF';
        }
        if (($data['pricing_mode'] ?? null) === 'quote') {
            $data['price_amount_abidjan']  = null;
            $data['price_amount_interior'] = null;
            $data['currency'] = $data['currency'] ?? 'XOF';
        }

        if (array_key_exists('features_json', $data)) {
            $data['features_json'] = array_values(array_filter((array) $data['features_json'], fn($v) => is_string($v) && trim($v) !== ''));
        } elseif (array_key_exists('features', $data)) {
            $data['features_json'] = array_values(array_filter((array) $data['features'], fn($v) => is_string($v) && trim($v) !== ''));
            unset($data['features']);
        }

        return $data;
    }


    private function serializeOffer(EnterpriseTypeOffer $o): array
    {
        $currency = $o->currency ?: 'XOF';

        return [
            'id'                      => $o->id,
            'enterprise_type_id'      => $o->enterprise_type_id,
            'key'                     => $o->key,
            'title'                   => $o->title,
            'subtitle'                => $o->subtitle,
            'is_active'               => (bool) $o->is_active,
            'pricing_mode'            => $o->pricing_mode,
            'price_amount_abidjan'    => $o->price_amount_abidjan,
            'price_amount_interior'   => $o->price_amount_interior,
            'currency'                => $currency,
            'features'                => array_values($o->features_json ?? []),
            'features_json'           => array_values($o->features_json ?? []),
            'delivery_min_days'       => $o->delivery_min_days,
            'delivery_max_days'       => $o->delivery_max_days,
            'pill'                    => $o->pill,
            'cta'                     => $o->cta,
            'sort_index'              => $o->sort_index,
            'meta'                    => $o->meta ?? [],
            'price_display_abidjan'   => $this->displayPrice($o->pricing_mode, $o->price_amount_abidjan, $currency),
            'price_display_interior'  => $this->displayPrice($o->pricing_mode, $o->price_amount_interior, $currency),
        ];
    }

    private function displayPrice(?string $mode, $amount, ?string $currency): string
    {
        $mode = $mode ?: 'quote';
        $currency = $currency ?: 'XOF';

        if ($mode === 'quote' || !$amount) return 'Sur devis';

        $formatted = number_format((float) $amount, 0, ',', ' ');
        return $mode === 'from'
            ? "À partir de {$formatted} {$currency}"
            : "{$formatted} {$currency}";
    }
}
