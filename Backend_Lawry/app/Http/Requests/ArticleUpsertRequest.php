<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArticleUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $category = $this->input('category');

        if (is_string($category)) {
            if (preg_match('#/categories/(\d+)#', $category, $m)) {
                $this->merge(['category_id' => (int) $m[1]]);
            } elseif (ctype_digit($category)) {
                $this->merge(['category_id' => (int) $category]);
            }
        } elseif (is_int($category)) {
            $this->merge(['category_id' => $category]);
        }

        if ($this->has('category_id')) {
            $this->merge(['category_id' => (int) $this->input('category_id')]);
        }
    }

    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'max:200'],
            'category_id'   => ['required', 'integer', 'exists:categories,id'],
            'status'        => ['sometimes', 'in:draft,published'],
            'excerpt'       => ['sometimes', 'nullable', 'string'],
            'content'       => ['required', 'string'],
            'image_url'     => ['sometimes', 'nullable', 'url'],
            'published_at'  => ['sometimes', 'nullable', 'date'],
        ];
    }
}
