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
            'name'        => array_merge($req(), ['string', 'max:255']),
            'price_cfa'   => array_merge($req(), ['integer', 'min:0']),
            'period'      => array_merge($req(), [Rule::in(['Mois', 'Année'])]),
            'color'       => array_merge($req(), [Rule::in(self::ALLOWED_COLORS)]),
            'description' => array_merge($req(), ['string']),
            'features'    => ['sometimes', 'array'],
            'features.*'  => ['string', 'max:255'],
            'is_active'   => ['sometimes', 'boolean'],
            'is_popular'  => ['sometimes', 'boolean'],
            'active'      => ['sometimes', 'boolean'],
            'popular'     => ['sometimes', 'boolean'],
            'code'        => ['sometimes', 'string', 'max:50', Rule::unique('plans', 'code')->ignore($this->route('plan'))],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('period')) {
            $p = mb_strtolower((string)$this->input('period'));
            if (in_array($p, ['mois', 'mensuel', 'mensuelle', 'month'], true)) $this->merge(['period' => 'Mois']);
            if (in_array($p, ['annee', 'année', 'annuel', 'annuelle', 'year'], true)) $this->merge(['period' => 'Année']);
        }

        if (is_string($this->input('features'))) {
            $parts = preg_split('/[\r\n,]+/', $this->input('features'));
            $parts = array_values(array_filter(array_map('trim', $parts)));
            $this->merge(['features' => $parts]);
        }

        //active/popular -> is_active/is_popular
        $b = fn($v) => filter_var($v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($this->has('active')  && ($x = $b($this->input('active')))  !== null) $this->merge(['is_active'  => $x]);
        if ($this->has('popular') && ($x = $b($this->input('popular'))) !== null) $this->merge(['is_popular' => $x]);
    }
}
