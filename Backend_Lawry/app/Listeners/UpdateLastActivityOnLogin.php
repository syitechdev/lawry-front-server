<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;

class UpdateLastActivityOnLogin
{
    public function handle(Login $event): void
    {
        $event->user->forceFill([
            'last_activity_at' => now(),
        ])->saveQuietly();
    }
}
