<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlanActiveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }
}
