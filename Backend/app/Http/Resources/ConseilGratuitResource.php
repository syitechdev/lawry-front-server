<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConseilGratuitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'first_name'   => $this->first_name,
            'last_name'    => $this->last_name,
            'email'        => $this->email,
            'phone'        => $this->phone,
            'legal_domain' => $this->legal_domain,
            'description'  => $this->description,
            'urgency'      => $this->urgency,
            'consent'      => (bool)$this->consent,
            'status'       => $this->status,
            'is_read'      => (bool)$this->is_read,
            'read_at'      => $this->read_at,
            'read_by'      => $this->read_by,
            'created_at'   => $this->created_at?->toIso8601String(),
            'updated_at'   => $this->updated_at?->toIso8601String(),
        ];
    }
}
