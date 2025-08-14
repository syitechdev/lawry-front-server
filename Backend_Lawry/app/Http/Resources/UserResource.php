<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'code'             => $this->code,
            'name'             => $this->name,
            'email'            => $this->email,
            'phone'            => $this->phone,
            'address'          => $this->address,
            'status'           => $this->status,
            'services_count'   => $this->services_count,
            'last_activity_at' => optional($this->last_activity_at)->toIso8601String(),
            'roles'            => $this->resource->getRoleNames()->values(),
            'created_at'       => optional($this->created_at)->toIso8601String(),
            'updated_at'       => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
