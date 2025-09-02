<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Contact;


class UpdateContactStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('contacts.update') ?? true;
    }
    public function rules(): array
    {
        return ['status' => ['required', 'string', 'in:' . implode(',', Contact::STATUSES)]];
    }
}
