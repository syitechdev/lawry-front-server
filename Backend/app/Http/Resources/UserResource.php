<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var \App\Models\User $u */
        $u = $this->resource;

        return [
            'id'               => $u->id,
            'code'             => $u->code,
            'name'             => $u->name,
            'email'            => $u->email,
            'phone'            => $u->phone,
            'address'          => $u->address,
            'profession'       => $u->profession,
            'nationality'      => $u->nationality,
            'status'           => $u->status,
            'services_count'   => $u->services_count,
            'last_activity_at' => optional($u->last_activity_at)->toIso8601String(),
            'email_verified_at' => optional($u->email_verified_at)->toIso8601String(),

            'roles'            => $u->getRoleNames()->values(),
            'permissions'      => $u->getAllPermissions()->pluck('name')->values(),

            'created_at'       => optional($u->created_at)->toIso8601String(),
            'updated_at'       => optional($u->updated_at)->toIso8601String(),
        ];
    }
}
