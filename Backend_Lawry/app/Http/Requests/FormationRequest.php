<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class FormationUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('POST');

        $required = fn($field) => [$isCreate ? 'required' : 'sometimes', 'filled'];

        return [
            'title'            => array_merge($required('title'), ['string', 'max:255']),
            'description'      => ['sometimes', 'nullable', 'string'],
            'price_cfa'        => array_merge($required('price_cfa'), ['integer', 'min:0']),
            'duration'         => array_merge($required('duration'), ['string', 'max:50']),
            'max_participants' => array_merge($required('max_participants'), ['integer', 'min:1']),
            'type'             => array_merge($required('type'), [Rule::in(['Présentiel', 'Webinaire', 'En ligne'])]),
            'date'             => array_merge($required('date'), ['date']),
            'category'         => ['sometimes'],
            'category_id'      => ['sometimes', 'integer', 'exists:categories,id'],
            'categoryId'       => ['sometimes', 'integer', 'exists:categories,id'],
            'trainer'          => array_merge($required('trainer'), ['string', 'max:255']),
            'active'           => ['sometimes', 'boolean'],
            'code'             => ['sometimes', 'string', 'max:50', Rule::unique('formations', 'code')->ignore($this->route('id') ?? $this->route('formation'))],
        ];
    }

    protected function prepareForValidation(): void
    {
        // 1) Mapper les champs camelCase -> snake_case attendus par les rules
        $map = [
            'priceCfa'        => 'price_cfa',
            'maxParticipants' => 'max_participants',
            'createdAt'       => 'created_at',
            'updatedAt'       => 'updated_at',
        ];
        $merge = [];
        foreach ($map as $from => $to) {
            if ($this->has($from) && !$this->has($to)) {
                $merge[$to] = $this->input($from);
            }
        }

        // 2) Normaliser la date si reçue en dd/mm/YYYY -> YYYY-mm-dd
        $d = $this->input('date');
        if (is_string($d) && preg_match('#^\d{2}/\d{2}/\d{4}$#', $d)) {
            try {
                $merge['date'] = \Carbon\Carbon::createFromFormat('d/m/Y', $d)->format('Y-m-d');
            } catch (\Throwable $e) {
                // ignore
            }
        }

        // 3) Accepter category / category_id / categoryId et en déduire category_id (int)
        if ($this->has('categoryId') && is_numeric($this->input('categoryId'))) {
            $merge['category_id'] = (int) $this->input('categoryId');
        }

        $cat = $this->input('category');
        if ($cat !== null && !isset($merge['category_id'])) {
            if (is_string($cat)) {
                // IRI: "/api/v1/categories/123"
                if (preg_match('/\/(\d+)(\?.*)?$/', $cat, $m)) {
                    $merge['category_id'] = (int) $m[1];
                } elseif (is_numeric($cat)) {
                    $merge['category_id'] = (int) $cat;
                }
            } elseif (is_array($cat)) {
                if (isset($cat['@id']) && is_string($cat['@id']) && preg_match('/\/(\d+)(\?.*)?$/', $cat['@id'], $m)) {
                    $merge['category_id'] = (int) $m[1];
                } elseif (isset($cat['id']) && is_numeric($cat['id'])) {
                    $merge['category_id'] = (int) $cat['id'];
                }
            }
        }

        if ($this->isMethod('POST') && !$this->filled('category_id') && !isset($merge['category_id'])) {
            $merge['category_id'] = null;
        }

        $this->merge($merge);
    }
}
