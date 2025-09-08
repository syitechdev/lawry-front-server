<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Auth\Events\Registered;
use App\Listeners\SendWelcomeEmail;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Models\Boutique;

class AppServiceProvider extends ServiceProvider
{

    protected $listen = [
        Registered::class => [
            SendWelcomeEmail::class,
        ],
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Sanctum::authenticateAccessTokensUsing(
            function (PersonalAccessToken $accessToken, bool $isValid): bool {
                if (! $isValid) return false;

                $user = $accessToken->tokenable;
                if ($user) {
                    if (! $user->last_activity_at || $user->last_activity_at->lt(now()->subMinutes(5))) {
                        $user->forceFill(['last_activity_at' => now()])->saveQuietly();
                    }
                }

                $idle = (int) config('sanctum.idle_timeout', 60);
                $last = $accessToken->last_used_at ?? $accessToken->created_at;
                return $last->gt(now()->subMinutes($idle));
            }
        );

        Event::listen(Login::class, function (Login $event) {
            $event->user->forceFill(['last_activity_at' => now()])->saveQuietly();
        });

        Event::listen(Authenticated::class, function (Authenticated $event) {
            $user = $event->user;
            if ($user && (! $user->last_activity_at || $user->last_activity_at->lt(now()->subMinutes(5)))) {
                $user->forceFill(['last_activity_at' => now()])->saveQuietly();
            }
        });

        Relation::morphMap([
            'formation' => \App\Models\Formation::class,
            'demande'   => \App\Models\Demande::class,
            'subscription' => \App\Models\Subscription::class,
            'boutique' => Boutique::class,
        ]);
    }
}
