<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignDemandeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id'  => ['nullable', 'integer', 'exists:users,id'],
            'takeover' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'takeover' => filter_var($this->input('takeover', false), FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
