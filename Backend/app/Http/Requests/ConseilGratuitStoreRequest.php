<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConseilGratuitStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'   => ['required', 'string', 'max:120'],
            'last_name'    => ['required', 'string', 'max:120'],
            'email'        => ['required', 'email', 'max:190'],
            'phone'        => ['nullable', 'string', 'max:40'],

            'legal_domain' => ['required', 'string', 'max:190'],
            'description'  => ['required', 'string', 'min:10'],

            'urgency'      => ['nullable', 'in:faible,moyen,eleve,critique'],
            'consent'      => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'consent.accepted' => "Vous devez accepter l'utilisation de vos données pour être recontacté.",
        ];
    }
}
