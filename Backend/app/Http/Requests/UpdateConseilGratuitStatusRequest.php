<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateConseilGratuitStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('conseils.read') || $this->user()?->can('conseils.update');
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['nouveau', 'en_cours', 'traite', 'clos', 'spam'])],
        ];
    }
}
