<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Http\UploadedFile;

class BoutiqueUpsertRequest extends FormRequest
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
            'name'        => array_merge($req(), ['string', 'max:255']),
            'price_cfa'   => array_merge($req(), ['integer', 'min:0']),
            'description' => array_merge($req(), ['string']),

            'type'        => ['required', Rule::in(['service', 'file'])],

            'category'    => ['sometimes'],
            'category_id' => [\Illuminate\Validation\Rule::requiredIf(fn() => !$this->has('category')), 'integer', 'exists:categories,id'],
            'categoryId'  => ['sometimes', 'integer', 'exists:categories,id'],

            // 'files'       => ['sometimes', 'array'],
            // 'files.*'     => ['string', 'max:255'],

            'files'       => [
                $this->input('type') === 'file' && $isCreate ? 'required' : 'sometimes',
                'array'
            ],

            'image'     => ['sometimes', 'file', 'mimes:jpg,jpeg,png,webp,avif,gif,svg', 'max:5120'],
            'image_url' => ['sometimes', 'url'],

            'is_active'   => ['sometimes', 'boolean'],
            'code'        => ['sometimes', 'string', 'max:50', \Illuminate\Validation\Rule::unique('boutiques', 'code')->ignore($this->route('boutique'))],

            'rating'           => ['sometimes', 'numeric', 'between:0,5'],
            'downloads_count'  => ['sometimes', 'integer', 'min:0'],

            'files_json'  => ['sometimes', 'array'],
            'files_json.*' => ['string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->has('type')) {
            $this->merge(['type' => 'service']);
        }

        if (is_string($this->input('files'))) {
            $parts = preg_split('/[\r\n,]+/', $this->input('files'));
            $parts = array_values(array_filter(array_map('trim', $parts)));
            $this->merge(['files' => $parts]);
        }

        $cat = $this->input('category_id');
        if ($cat === null) $cat = $this->input('categoryId');
        if ($cat === null) $cat = $this->input('category');
        if (is_string($cat) && preg_match('/\/(\d+)(\?.*)?$/', $cat, $m)) {
            $this->merge(['category_id' => (int) $m[1]]);
        } elseif (is_array($cat) && isset($cat['@id']) && preg_match('/\/(\d+)(\?.*)?$/', $cat['@id'], $m)) {
            $this->merge(['category_id' => (int) $m[1]]);
        } elseif (is_array($cat) && isset($cat['id'])) {
            $this->merge(['category_id' => (int) $cat['id']]);
        } elseif (is_numeric($cat)) {
            $this->merge(['category_id' => (int) $cat]);
        }

        // Cast dur si déjà présent
        if ($this->has('category_id')) {
            $this->merge(['category_id' => (int) $this->input('category_id')]);
        }
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            if (!$this->filled('files') || !is_array($this->input('files'))) {
                return;
            }

            foreach ($this->input('files') as $idx => $val) {
                $file = $this->file("files.$idx");
                if ($file instanceof UploadedFile) {
                    if ($file->getSize() > 10 * 1024 * 1024) {
                        $v->errors()->add("files.$idx", 'Chaque fichier doit faire au plus 10 Mo.');
                    }
                    continue;
                }

                if (!is_string($val) || mb_strlen($val) > 255) {
                    $v->errors()->add("files.$idx", 'Doit être un chemin/URL (string ≤ 255) ou un fichier uploadé.');
                }
            }
        });
    }
}
