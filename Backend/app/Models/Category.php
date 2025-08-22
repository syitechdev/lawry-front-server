<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

// API Platform
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ApiResource(
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\CategoryUpsertRequest::class,
    operations: [
        new GetCollection(),
        new Get(),
        new Post(middleware: ['auth:sanctum', 'permission:categories.create']),
        new Patch(middleware: ['auth:sanctum', 'permission:categories.update']),
        new Delete(middleware: ['auth:sanctum', 'permission:categories.delete']),
    ],
)]

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description'];

    protected static function booted()
    {
        static::saving(function (Category $cat) {
            if (empty($cat->slug) && !empty($cat->name)) {
                $cat->slug = Str::slug($cat->name);
            }
        });
    }
}
