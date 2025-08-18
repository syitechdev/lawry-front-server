<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TarifUniqueUpsertRequest extends FormRequest
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
        $isCreate = $this->isMethod('POST');
        $req = fn() => [$isCreate ? 'required' : 'sometimes', 'filled'];

        return [
            'nom'        => array_merge($req(), ['string', 'max:255']),
            'prix'       => array_merge($req(), ['integer', 'min:0']),
            'description' => ['sometimes', 'string', 'nullable'],
            'actif'      => ['sometimes', 'boolean'],
        ];
    }
}
