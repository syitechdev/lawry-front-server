<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'formation_id' => ['required', 'integer', 'exists:formations,id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'profession' => ['required', 'string', 'max:100'],
            'company' => ['nullable', 'string', 'max:150'],
            'experience' => ['required', 'in:debutant,intermediaire,avance'],
            'session_format' => ['required', 'in:presentiel,distanciel'],
            'motivation' => ['required', 'string', 'min:10'],
            'specific_needs' => ['nullable', 'string'],
            'source' => ['nullable', 'string', 'max:50'],
        ];
    }
}
