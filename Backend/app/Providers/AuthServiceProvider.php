<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\User;
use App\Policies\UserPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;


class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        User::class => UserPolicy::class,
    ];

    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontend = rtrim(config('app.frontend_url') ?? env('FRONTEND_URL', ''), '/');
            $email    = urlencode($notifiable->getEmailForPasswordReset());
            return "{$frontend}/reset-password?token={$token}&email={$email}";
        });

        ResetPassword::toMailUsing(function ($notifiable, string $token) {
            $frontend = rtrim(config('app.frontend_url') ?? env('FRONTEND_URL', ''), '/');
            $email    = urlencode($notifiable->getEmailForPasswordReset());
            $resetUrl = "{$frontend}/reset-password?token={$token}&email={$email}";

            $appName = config('app.name', 'Lawry');
            $expires = config('auth.passwords.' . config('auth.defaults.passwords') . '.expire') ?? 60;

            return (new MailMessage)
                ->subject("Réinitialisation du mot de passe — {$appName}")
                ->view('emails.reset-password', [
                    'user'     => $notifiable,
                    'appName'  => $appName,
                    'resetUrl' => $resetUrl,
                    'expires'  => $expires,
                ]);
        });
    }
}
