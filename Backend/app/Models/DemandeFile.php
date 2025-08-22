<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandeFile extends Model
{
    protected $fillable = ['demande_id', 'tag', 'original_name', 'path', 'mime', 'size', 'uploaded_by'];
    public function demande()
    {
        return $this->belongsTo(Demande::class);
    }
}
