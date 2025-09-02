<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'period'  => 'required|in:monthly,yearly',
            'email'   => 'nullable|email',
            'name'    => 'nullable|string|max:255',
        ]);

        $plan = Plan::findOrFail($request->plan_id);

        if (auth()->check() && !auth()->user()->hasRole('admin')) {
            $user = auth()->user();
        } else {
            if (!$request->email) {
                return response()->json([
                    'message' => 'Email requis pour créer une souscription'
                ], 422);
            }

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                $password = Str::random(10);

                $user = User::create([
                    'name'     => $request->input('name', 'Client'),
                    'email'    => $request->email,
                    'password' => Hash::make($password),
                ]);

                if (method_exists($user, 'assignRole')) {
                    $user->assignRole('client');
                }
            }
        }

        $activeSub = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('plan_id', $plan->id)
            ->where(function ($q) {
                $q->whereNull('current_cycle_end')
                    ->orWhere('current_cycle_end', '>', now());
            })
            ->first();

        if ($activeSub) {
            return response()->json([
                'message' => 'Vous avez déjà un abonnement actif pour ce plan'
            ], 422);
        }

        $meta = [
            'ip'         => $request->ip(),
            'user_agent' => $request->userAgent(),
            'host'       => $request->getHost(),
            'referer'    => $request->headers->get('referer'),
        ];

        if ($plan->is_trial || (int) $plan->monthly_price_cfa === 0) {

            $alreadyTried = Subscription::where('user_id', $user->id)
                ->where('plan_id', $plan->id)
                ->exists();

            if ($alreadyTried) {
                return response()->json([
                    'message' => 'Vous avez déjà utilisé votre période d\'essai gratuite.'
                ], 422);
            }
            $subscription = Subscription::create([
                'user_id'             => $user->id,
                'plan_id'             => $plan->id,
                'period'              => $request->period,
                'status'              => 'active',
                'current_cycle_start' => now(),
                'current_cycle_end'   => $plan->trial_days
                    ? now()->addDays((int) $plan->trial_days)
                    : now()->addMonth(),
                'last_payment_reference' => null,
                'meta'                => $meta,
            ]);

            return response()->json([
                'message'      => 'Essai gratuit activé avec succès',
                'subscription' => $subscription,
                'user'         => $user,
            ], 201);
        }

        $subscription = Subscription::create([
            'user_id'              => $user->id,
            'plan_id'              => $plan->id,
            'period'               => $request->period,
            'status'               => 'pending_payment',
            'current_cycle_start'  => null,
            'current_cycle_end'    => null,
            'last_payment_reference' => null,
            'meta'                 => $meta,
        ]);

        return response()->json([
            'message'      => 'Souscription créée avec succès',
            'subscription' => $subscription,
            'user'         => $user,
        ]);
    }
}
