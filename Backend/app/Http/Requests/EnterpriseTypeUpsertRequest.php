<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnterpriseTypeUpsertRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $id = $this->route('id') ?? $this->route('enterprise_type')?->id;
        return [
            'sigle'         => ['required', 'string', 'max:50', Rule::unique('enterprise_types', 'sigle')->ignore($id)],
            'signification' => ['required', 'string', 'max:255'],
            'description'   => ['sometimes', 'nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('sigle')) {
            $this->merge(['sigle' => mb_strtoupper(trim((string)$this->input('sigle')))]);
        }
        if ($this->has('signification')) {
            $this->merge(['signification' => trim((string)$this->input('signification'))]);
        }
    }
}
