<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $toMerge = [];

        foreach (['phone', 'address', 'profession', 'nationality'] as $field) {
            if ($this->exists($field)) {
                $v = $this->input($field);
                $v = is_string($v) ? trim($v) : $v;
                $toMerge[$field] = ($v === '') ? null : $v;
            }
        }

        // rétro-compat: "role" -> "roles[]"
        if ($this->filled('role') && !$this->filled('roles')) {
            $toMerge['roles'] = [(string)$this->input('role')];
        }

        if (!empty($toMerge)) {
            $this->merge($toMerge);
        }
    }

    public function rules(): array
    {
        $userModel = $this->route('user');
        $id = $userModel?->id ?? $this->route('id');

        $isCreate = $this->isMethod('post');

        $emailUnique = Rule::unique('users', 'email');
        if ($id) $emailUnique = $emailUnique->ignore($id);

        return [
            'name'              => [$isCreate ? 'required' : 'sometimes', 'string', 'max:100'],
            'email'             => [$isCreate ? 'required' : 'sometimes', 'email', 'max:255', $emailUnique],
            'phone'             => ['nullable', 'string', 'max:30'],
            'address'           => ['nullable', 'string', 'max:255'],
            'profession'        => ['nullable', 'string', 'max:255'],
            'nationality'       => ['nullable', 'string', 'max:255'],
            'status'            => ['sometimes', Rule::in(['Actif', 'Inactif', 'VIP'])],
            'services_count'    => ['sometimes', 'integer', 'min:0'],
            'last_activity_at'  => ['sometimes', 'date'],
            'password'          => [$isCreate ? 'required' : 'sometimes', 'string', 'min:8', 'confirmed'],

            // RBAC
            'role'              => ['sometimes', 'string', Rule::exists('roles', 'name')],
            'roles'             => ['sometimes', 'array'],
            'roles.*'           => ['string', Rule::exists('roles', 'name')],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Cet email est déjà utilisé.',
        ];
    }
}
