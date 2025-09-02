<?php

namespace App\Http\Requests;

use App\Models\RequestType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        if ($vk === '' || $vk === 'undefined' || $vk === 'null') $vk = null;

        $urgentInput = $this->input('urgent', null);
        $urgentNormalized = null;
        if ($urgentInput !== null) {
            $val = is_string($urgentInput) ? strtolower(trim($urgentInput)) : $urgentInput;
            $truthy = ['1', 1, true, 'true', 'on', 'yes'];
            $falsy  = ['0', 0, false, 'false', 'off', 'no', ''];
            $urgentNormalized = in_array($val, $truthy, true) ? 1 : (in_array($val, $falsy, true) ? 0 : null);
        }

        // --- Normalisation enterprise_type_sigle
        $sigle = $this->input('enterprise_type_sigle', $this->input('data.enterprise_type_sigle'));
        if (is_string($sigle) && $sigle !== '') {
            $sigle = strtoupper(trim(preg_replace('/\s+/', ' ', $sigle)));
        } else {
            $sigle = null;
        }

        // --- Normalisation enterprise_type_id
        $rawEtypeId = $this->input('enterprise_type_id', $this->input('data.enterprise_type_id'));
        if (is_string($rawEtypeId)) {
            $trim = trim($rawEtypeId);
            if ($trim === '' || strtolower($trim) === 'null' || strtolower($trim) === 'undefined') {
                $rawEtypeId = null;
            }
        }
        $etypeId = ($rawEtypeId !== null && $rawEtypeId !== '' && is_numeric($rawEtypeId))
            ? (int) $rawEtypeId
            : null;

        // --- Merge SANS injecter de null
        $merge = ['variant_key' => $vk];
        if ($urgentNormalized !== null)        $merge['urgent'] = $urgentNormalized;
        if ($sigle !== null)                   $merge['enterprise_type_sigle'] = $sigle;
        if ($etypeId !== null)                 $merge['enterprise_type_id']    = $etypeId;

        $this->merge($merge);
    }

    public function rules(): array
    {
        $activeSlugs = RequestType::activeSlugs();
        $type = (string) $this->input('type');

        return [
            'type' => ['required', 'string', Rule::in($activeSlugs)],

            // Toujours optionnels; on ne les rend obligatoires qu'en post-validation si type=creer-entreprise
            'enterprise_type_id'    => ['sometimes', 'nullable', 'integer', 'exists:enterprise_types,id'],
            'enterprise_type_sigle' => ['sometimes', 'nullable', 'string'],
            'offer_key'             => ['sometimes', 'nullable', 'string'],

            'variant_key' => [
                'nullable',
                'string',
                Rule::requiredIf(fn() => in_array($type, ['rediger-contrat', 'creer-entreprise', 'conseil'], true)),
            ],

            'urgent' => ['sometimes', 'boolean'],
            'data'   => ['required', 'array'],
            'files'  => ['sometimes', 'array'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $type = (string) $this->input('type');
            $vk   = (string) $this->input('variant_key', '');

            if ($type === 'rediger-contrat') {
                $rt = \App\Models\RequestType::where('slug', $type)->first();
                $config = (array) ($rt?->config ?? []);

                $fromCards    = collect((array) data_get($config, 'variant_cards', []))
                    ->where('active', '!==', false)->pluck('key')->filter()->values()->all();
                $fromOrder    = collect((array) data_get($config, 'order', []))->map(fn($x) => (string)$x)->filter()->values()->all();
                $fromVariants = collect((array) data_get($config, 'variants', []))
                    ->where('active', '!==', false)->pluck('key')->filter()->values()->all();
                $fromCsv      = (array) ($rt?->variants ?? []);

                $allowed = collect([$fromCards, $fromOrder, $fromVariants, $fromCsv])
                    ->flatten()->map(fn($x) => (string)$x)->filter()->unique()->values()->all();

                if (!$vk || !in_array($vk, $allowed, true)) {
                    $v->errors()->add('variant_key', 'Variante invalide pour ce type.');
                }
            }

            if ($type === 'creer-entreprise') {
                $hasId    = $this->filled('enterprise_type_id');
                $hasSigle = $this->filled('enterprise_type_sigle');
                $vkHasSig = $vk && (bool) preg_match('/^[A-Z]{2,}\s*[:|.\/]/', str_replace(' ', '', $vk));

                if (!($hasId || $hasSigle || $vkHasSig)) {
                    $v->errors()->add(
                        'enterprise_type_sigle',
                        'Veuillez fournir un type d’entreprise via enterprise_type_id, enterprise_type_sigle ou un variant_key du style "SARLU:offre".'
                    );
                }
            }

            if ($type === 'contrat-travail') {
                $rt = \App\Models\RequestType::where('slug', $type)->first();
                $variants = $rt?->variants ?? [];
                $cat = data_get($this->input('data'), 'categorie');
                if ($cat && $variants && !in_array($cat, $variants, true)) {
                    $v->errors()->add('data.categorie', 'Catégorie invalide.');
                }
                if (in_array($cat, ['CDD', 'Stage'], true)) {
                    $duree = data_get($this->input('data'), 'dureeMois');
                    if ($duree === null || $duree === '') {
                        $v->errors()->add('data.dureeMois', 'La durée (mois) est requise pour CDD ou Stage.');
                    }
                }
            }
        });
    }
}
