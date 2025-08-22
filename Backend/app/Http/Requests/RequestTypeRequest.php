<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RequestTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('requestType')?->id ?? null;

        return [
            'name' => ['required', 'string', 'max:190'],
            'slug' => ['required', 'string', 'max:190', Rule::unique('request_types', 'slug')->ignore($id)],
            'version' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'pricing_mode' => ['nullable', Rule::in(['quote', 'fixed', 'from'])],
            'price_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'variants_csv' => ['nullable', 'string', 'max:2000'],
            'features_csv' => ['nullable', 'string', 'max:2000'],
            'config' => ['nullable', 'array'],
        ];
    }
}
