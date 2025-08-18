<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class FormationUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('POST');
        $req = fn($f) => [$isCreate ? 'required' : 'sometimes', 'filled'];

        return [
            'title'            => array_merge($req('title'), ['string', 'max:255']),
            'description'      => ['sometimes', 'nullable', 'string'],
            'price_cfa'        => ['sometimes', 'nullable', 'integer', 'min:0'],
            'price_type'       => ['sometimes', 'in:fixed,quote'],
            'duration'         => array_merge($req('duration'), ['string', 'max:50']),
            'max_participants' => array_merge($req('max_participants'), ['integer', 'min:1']),
            'type'             => array_merge($req('type'), ['string', 'max:100']),
            'level'            => ['sometimes', 'nullable', 'string', 'max:100'],
            'date'             => ['sometimes', 'date'],
            'trainer'          => ['sometimes', 'nullable', 'string', 'max:255'],
            'active'           => ['sometimes', 'boolean'],
            'modules'          => ['sometimes', 'array'],
            'modules.*'        => ['string', 'max:255'],
            'code'             => ['sometimes', 'string', 'max:50', Rule::unique('formations', 'code')->ignore($this->route('id') ?? $this->route('formation'))],
            'category_id'      => ['sometimes', 'integer', 'exists:categories,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $map = ['priceCfa' => 'price_cfa', 'maxParticipants' => 'max_participants'];
        $merge = [];
        foreach ($map as $from => $to) {
            if ($this->has($from) && !$this->has($to)) $merge[$to] = $this->input($from);
        }

        $d = $this->input('date');
        if (is_string($d) && preg_match('#^\d{2}/\d{2}/\d{4}$#', $d)) {
            try {
                $merge['date'] = Carbon::createFromFormat('d/m/Y', $d)->format('Y-m-d');
            } catch (\Throwable $e) {
            }
        }

        $this->merge($merge);
    }
}
