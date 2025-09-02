<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlanUpsertRequest extends FormRequest
{
    public const ALLOWED_COLORS = ['Bleu', 'Vert', 'Rouge', 'Jaune', 'Violet', 'Orange', 'Gris', 'Noir', 'Blanc', 'Cyan', 'Rose'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('POST');
        $req = fn() => [$isCreate ? 'required' : 'sometimes', 'filled'];

        return [
            'slug'   => ['sometimes', 'string', 'max:120', Rule::unique('plans', 'slug')->ignore($this->route('plan') ?? $this->route('id'))],
            'name'   => array_merge($req(), ['string', 'max:255']),
            'code'   => ['sometimes', 'string', 'max:50', Rule::unique('plans', 'code')->ignore($this->route('plan') ?? $this->route('id'))],

            'monthly_price_cfa' => ['sometimes', 'integer', 'min:0'],
            'yearly_price_cfa'  => ['sometimes', 'integer', 'min:0'],

            'is_trial'   => ['sometimes', 'boolean'],
            'trial_days' => ['nullable', 'integer', 'min:1', 'max:60'],

            'color'        => ['sometimes', Rule::in(self::ALLOWED_COLORS)],
            'description'  => ['sometimes', 'string', 'max:2000'],
            'features'     => ['sometimes', 'array'],
            'features.*'   => ['string', 'max:255'],
            'gradient_from' => ['sometimes', 'string', 'max:50'],
            'gradient_to'  => ['sometimes', 'string', 'max:50'],
            'sort_index'   => ['sometimes', 'integer', 'min:0'],

            'is_active' => ['sometimes', 'boolean'],
            'popular'   => ['sometimes', 'boolean'],

            'price_cfa'  => ['sometimes', 'integer', 'min:0'],
            'period'     => ['sometimes', 'string'],
            'active'     => ['sometimes'],
            'is_popular' => ['sometimes'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $aliases = [
            'monthlyPriceCfa' => 'monthly_price_cfa',
            'yearlyPriceCfa'  => 'yearly_price_cfa',
            'priceCfa'        => 'price_cfa',
            'isTrial'         => 'is_trial',
            'trialDays'       => 'trial_days',
            'isActive'        => 'is_active',
            'isPopular'       => 'popular',
            'gradientFrom'    => 'gradient_from',
            'gradientTo'      => 'gradient_to',
            'sortIndex'       => 'sort_index',
        ];

        foreach ($aliases as $from => $to) {
            if ($this->has($from)) {
                $this->merge([$to => $this->input($from)]);
            }
        }

        $periodRaw = $this->input('period');
        if ($periodRaw !== null) {
            $p = mb_strtolower((string)$periodRaw);
            $isMonthly = in_array($p, ['mois', 'mensuel', 'mensuelle', 'month', 'm', 'mensual', 'monthly'], true);
            $isYearly  = in_array($p, ['annee', 'année', 'annuel', 'annuelle', 'year', 'a', 'yearly'], true);
            if ($this->has('price_cfa')) {
                $price = (int) $this->input('price_cfa');
                if ($isMonthly) $this->merge(['monthly_price_cfa' => $price]);
                if ($isYearly)  $this->merge(['yearly_price_cfa'  => $price]);
            }
        }

        if (is_string($this->input('features'))) {
            $parts = preg_split('/[\r\n,]+/', (string)$this->input('features'));
            $parts = array_values(array_filter(array_map('trim', $parts)));
            $this->merge(['features' => $parts]);
        }

        $b = fn($v) => filter_var($v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($this->has('active')) {
            $x = $b($this->input('active'));
            if ($x !== null) $this->merge(['is_active' => $x]);
        }
        if ($this->has('is_popular')) {
            $x = $b($this->input('is_popular'));
            if ($x !== null) $this->merge(['popular' => $x]);
        }
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $isTrial = $this->boolean('is_trial');
            $monthly = (int) $this->input('monthly_price_cfa', 0);
            $yearly  = (int) $this->input('yearly_price_cfa', 0);

            if ($isTrial) {
                if ($monthly !== 0 || $yearly !== 0) {
                    $v->errors()->add('is_trial', 'Un plan d’essai ne doit pas avoir de prix mensuel/annuel non nuls.');
                }
            } else {
                if ($monthly <= 0 && $yearly <= 0) {
                    $v->errors()->add('monthly_price_cfa', 'Indique un prix mensuel ou annuel > 0 (hors essai).');
                    $v->errors()->add('yearly_price_cfa',  'Indique un prix mensuel ou annuel > 0 (hors essai).');
                }
            }
        });
    }
}
