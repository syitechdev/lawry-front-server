<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('contacts.update') ?? true;
    }
    public function rules(): array
    {
        return ['assigned_to' => ['nullable', 'integer', 'exists:users,id']];
    }
}
