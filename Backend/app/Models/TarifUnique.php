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
    operations: [new GetCollection(), new Get(), new Post(), new Patch(), new Delete()],
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\TarifUniqueUpsertRequest::class,
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
