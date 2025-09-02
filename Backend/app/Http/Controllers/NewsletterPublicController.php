<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubscribeRequest;
use App\Http\Requests\UnsubscribeRequest;
use App\Models\NewsletterSubscription;
use Illuminate\Http\Request;

class NewsletterPublicController extends Controller
{
    public function subscribe(SubscribeRequest $req)
    {
        $email = mb_strtolower($req->validated()['email']);

        $sub = NewsletterSubscription::where('email', $email)->first();

        if (!$sub) {
            $sub = NewsletterSubscription::create([
                'email' => $email,
                'ip_address' => $req->ip(),
                'user_agent' => (string) ($req->header('User-Agent') ?? ''),
            ]);
            return response()->json(['message' => 'Inscription réussie', 'data' => $sub], 201);
        }

        if ($sub->unsubscribed_at) {
            $sub->forceFill([
                'unsubscribed_at' => null,
                'ip_address' => $req->ip(),
                'user_agent' => (string) ($req->header('User-Agent') ?? ''),
            ])->save();

            return response()->json(['message' => 'Inscription réactivée', 'data' => $sub]);
        }

        return response()->json(['message' => 'Déjà inscrit', 'data' => $sub]);
    }

    public function unsubscribe(UnsubscribeRequest $req)
    {
        $email = mb_strtolower($req->validated()['email']);

        $sub = NewsletterSubscription::where('email', $email)->active()->first();
        if (!$sub) {
            return response()->json(['message' => 'Aucun abonnement actif pour cet email'], 404);
        }

        $sub->forceFill(['unsubscribed_at' => now()])->save();

        return response()->json(['message' => 'Désinscription réussie']);
    }
}
