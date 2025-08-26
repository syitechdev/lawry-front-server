<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\RequestType;

class DemandeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }


    protected function prepareForValidation(): void
    {
        $vk = $this->input('variant_key');
        $vk = is_string($vk) ? trim($vk) : $vk;
        if ($vk === '' || $vk === 'undefined' || $vk === 'null') {
            $vk = null;
        }

        $urgentInput = $this->input('urgent', null);
        $urgentNormalized = null;
        if ($urgentInput !== null) {
            $val = is_string($urgentInput) ? strtolower(trim($urgentInput)) : $urgentInput;
            $truthy = ['1', 1, true, 'true', 'on', 'yes'];
            $falsy  = ['0', 0, false, 'false', 'off', 'no', ''];
            if (in_array($val, $truthy, true)) {
                $urgentNormalized = 1;
            } elseif (in_array($val, $falsy, true)) {
                $urgentNormalized = 0;
            } else {
                $urgentNormalized = null;
            }
        }

        $merge = ['variant_key' => $vk];
        if ($urgentNormalized !== null) {
            $merge['urgent'] = $urgentNormalized;
        }

        $this->merge($merge);
    }

    public function rules(): array
    {
        $activeSlugs = RequestType::activeSlugs();
        $type = (string) $this->input('type');

        return [
            'type'        => ['required', 'string', Rule::in($activeSlugs)],

            'variant_key' => [
                'nullable',
                'string',
                Rule::requiredIf(fn() => in_array($type, ['rediger-contrat', 'creer-entreprise', 'conseil'], true)),

            ],

            'urgent'      => ['sometimes', 'boolean'],

            'data'        => ['required', 'array'],
            'files'       => ['sometimes', 'array'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $type = (string) $this->input('type');
            if ($type === 'contrat-travail') {
                $rt = RequestType::where('slug', $type)->first();
                $variants = $rt?->variants ?? [];

                $cat = data_get($this->input('data'), 'categorie');
                if ($cat && $variants && !in_array($cat, $variants, true)) {
                    $v->errors()->add('data.categorie', 'Catégorie invalide (doit être une des variantes définies par l’admin).');
                }

                if (in_array($cat, ['CDD', 'Stage'], true)) {
                    $duree = data_get($this->input('data'), 'dureeMois');
                    if ($duree === null || $duree === '') {
                        $v->errors()->add('data.dureeMois', 'La durée (mois) est requise pour CDD ou Stage.');
                    }
                }
            }

            if ($type === 'rediger-contrat') {
                $rt = RequestType::where('slug', $type)->first();
                $config = (array) ($rt?->config ?? []);

                $fromCards = collect((array) data_get($config, 'variant_cards', []))
                    ->filter(fn($x) => data_get($x, 'active', true))
                    ->map(fn($x) => (string) data_get($x, 'key'))
                    ->filter()
                    ->values()
                    ->all();


                $fromOrder = collect((array) data_get($config, 'order', []))
                    ->map(fn($x) => (string) $x)
                    ->filter()
                    ->values()
                    ->all();

                $fromVariants = collect((array) data_get($config, 'variants', []))
                    ->filter(fn($x) => data_get($x, 'active', true))
                    ->map(fn($x) => (string) data_get($x, 'key'))
                    ->filter()
                    ->values()
                    ->all();

                $fromCsv = (array) ($rt?->variants ?? []);

                $allowed = collect([$fromCards, $fromOrder, $fromVariants, $fromCsv])
                    ->flatten()
                    ->map(fn($x) => (string) $x)
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();

                $vk = $this->input('variant_key');
                if (!$vk || !in_array((string) $vk, $allowed, true)) {
                    $v->errors()->add('variant_key', 'Variante invalide pour ce type.');
                }
            }
        });
    }
}
