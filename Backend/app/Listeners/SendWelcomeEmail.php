<?php

namespace App\Listeners;

use App\Mail\WelcomeUserMail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail implements ShouldQueue
{

    public function handle(Registered $event): void
    {
        $user = $event->user;
        if (!$user || !$user->email) return;

        Mail::to($user->email)->queue(new WelcomeUserMail($user));
    }
}
