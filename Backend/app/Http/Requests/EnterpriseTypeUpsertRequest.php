<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnterpriseTypeUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PATCH') || $this->isMethod('PUT');

        $id = $this->route('enterpriseType')->id
            ?? ($this->route('enterprise_type')->id ?? $this->route('id'));

        return [
            'sigle'         => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:50',
                Rule::unique('enterprise_types', 'sigle')->ignore($id),
            ],
            'signification' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'description'   => ['sometimes', 'nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('sigle')) {
            $this->merge(['sigle' => mb_strtoupper(trim((string) $this->input('sigle')))]);
        }
        if ($this->has('signification')) {
            $this->merge(['signification' => trim((string) $this->input('signification'))]);
        }
    }
}
