<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('service')?->id;
        $isCreate = $this->isMethod('POST');

        $req = fn() => [$isCreate ? 'required' : 'sometimes', 'filled'];

        return [
            'title'         => array_merge($req(), ['string', 'max:180']),
            'code'          => ['sometimes', 'string', 'max:20', Rule::unique('services', 'code')->ignore($id)],
            'is_active'     => ['sometimes', 'boolean'],
            'description'   => ['sometimes', 'nullable', 'string'],
            'price_cfa'     => ['sometimes', 'integer', 'min:0'],
            'duration_days' => ['sometimes', 'nullable', 'string', 'max:100'],
            'orders_count'  => ['sometimes', 'integer', 'min:0'],
            'rating'        => ['sometimes', 'numeric', 'min:0', 'max:5'],
            'documents'     => ['sometimes'],
            'documents.*'   => ['string', 'max:100'],
            // aliases UI
            'active'        => ['sometimes'],
            'statut'        => ['sometimes', 'string'],
            'nom'           => ['sometimes', 'string', 'max:180'],
            'prix'          => ['sometimes'],
            'duree'         => ['sometimes', 'string', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Aliases UI -> colonnes
        if ($this->has('nom') && !$this->has('title')) {
            $this->merge(['title' => $this->input('nom')]);
        }
        if ($this->has('prix') && !$this->has('price_cfa')) {
            $this->merge(['price_cfa' => (int)$this->input('prix')]);
        }
        if ($this->has('duree') && !$this->has('duration_days')) {
            $this->merge(['duration_days' => (string)$this->input('duree')]);
        }
        if ($this->has('statut') && !$this->has('is_active')) {
            $v = mb_strtolower(trim((string)$this->input('statut')));
            $this->merge(['is_active' => in_array($v, ['actif', 'active', '1', 'true', 'oui'], true)]);
        }
        if ($this->has('active') && !$this->has('is_active')) {
            $this->merge(['is_active' => filter_var($this->input('active'), FILTER_VALIDATE_BOOLEAN)]);
        }

        // documents: string "a, b, c" -> array
        if ($this->has('documents') && is_string($this->input('documents'))) {
            $parts = preg_split('/[\r\n,]+/', (string)$this->input('documents'));
            $parts = array_values(array_filter(array_map('trim', $parts)));
            $this->merge(['documents' => $parts]);
        }

        if ($this->has('price_cfa')) {
            $this->merge(['price_cfa' => (int)$this->input('price_cfa')]);
        }

        if ($this->has('rating')) {
            $r = (float)$this->input('rating');
            if ($r < 0) $r = 0;
            if ($r > 5) $r = 5;
            $this->merge(['rating' => $r]);
        }

        if ($this->has('orders_count')) {
            $this->merge(['orders_count' => (int)$this->input('orders_count')]);
        }
    }
}
