<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ApiResource(
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\TarifUniqueUpsertRequest::class,
    operations: [
        new GetCollection(),
        new Get(),
        new Post(middleware: ['auth:sanctum', 'permission:tarifs.create']),
        new Patch(middleware: ['auth:sanctum', 'permission:tarifs.update']),
        new Delete(middleware: ['auth:sanctum', 'permission:tarifs.delete']),
    ],
)]

class TarifUnique extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'prix',
        'description',
        'actif',
    ];

    protected $casts = [
        'prix' => 'integer',
        'actif' => 'boolean',
    ];
}
