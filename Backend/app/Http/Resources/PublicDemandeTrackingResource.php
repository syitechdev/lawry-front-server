<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicDemandeTrackingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'tracking' => [
                'number'   => $this->number,
                'type'     => $this->type,
                'status'   => $this->status,
                'progress' => (int) $this->progress,

                'dates' => [
                    'created_at'          => $this->dates['created_at'] ?? null,
                    'submitted_at'        => $this->dates['submitted_at'] ?? null,
                    'estimated_completion' => $this->dates['estimated_completion'] ?? null,
                ],

                'client_hint' => $this->client_hint,

                'steps' => array_map(function ($s) {
                    return [
                        'name'   => (string) $s['name'],
                        'status' => (string) $s['status'],
                        'date'   => $s['date'] ?: null,
                    ];
                }, $this->steps ?? []),
            ],
        ];
    }
}
