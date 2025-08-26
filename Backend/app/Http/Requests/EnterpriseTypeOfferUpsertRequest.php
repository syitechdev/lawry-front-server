<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnterpriseTypeOfferUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $offer = $this->route('offer');
        $enterpriseTypeId = (int) ($this->route('id') ?? $this->input('enterprise_type_id'));

        return [
            'enterprise_type_id'   => ['required', 'exists:enterprise_types,id'],
            'key'                  => [
                'required',
                'string',
                'max:100',
                Rule::unique('enterprise_type_offers', 'key')
                    ->where('enterprise_type_id', $enterpriseTypeId)
                    ->ignore(optional($offer)->id)
            ],
            'title'                => ['required', 'string', 'max:255'],
            'subtitle'             => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_active'            => ['sometimes', 'boolean'],
            'pricing_mode'         => ['required', Rule::in(['fixed', 'from', 'quote'])],
            'price_amount_abidjan' => ['nullable', 'integer', 'min:0'],
            'price_amount_interior' => ['nullable', 'integer', 'min:0'],
            'currency'             => ['sometimes', 'string', 'max:10'],
            'features_json'        => ['sometimes', 'array'],
            'features_json.*'      => ['string', 'max:500'],
            'delivery_min_days'    => ['nullable', 'integer', 'min:0', 'max:90'],
            'delivery_max_days'    => ['nullable', 'integer', 'min:0', 'max:180'],
            'pill'                 => ['nullable', 'string', 'max:100'],
            'cta'                  => ['nullable', 'string', 'max:100'],
            'sort_index'           => ['sometimes', 'integer'],
            'meta'                 => ['sometimes', 'array'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $mode = $this->input('pricing_mode');

            if (in_array($mode, ['fixed', 'from'], true)) {
                $abj = $this->input('price_amount_abidjan');
                $int = $this->input('price_amount_interior');
                if (!is_numeric($abj) && !is_numeric($int)) {
                    $v->errors()->add('price_amount_abidjan', 'Au moins un tarif (Abidjan ou Intérieur) est requis pour ce mode de prix.');
                    $v->errors()->add('price_amount_interior', 'Au moins un tarif (Abidjan ou Intérieur) est requis pour ce mode de prix.');
                }
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'key' => trim((string)$this->input('key')),
            'title' => trim((string)$this->input('title')),
            'subtitle' => $this->filled('subtitle') ? trim((string)$this->input('subtitle')) : null,
        ]);
    }
}
