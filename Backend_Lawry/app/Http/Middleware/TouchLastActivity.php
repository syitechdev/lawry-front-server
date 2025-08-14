<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TouchLastActivity
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $user = $request->user();
        if ($user) {
            $now = now();
            $shouldUpdate = is_null($user->last_activity_at)
                || $user->last_activity_at->lt($now->clone()->subMinutes(5));

            if ($shouldUpdate) {
                $user->forceFill(['last_activity_at' => $now])->saveQuietly();
            }
        }

        return $response;
    }
}
