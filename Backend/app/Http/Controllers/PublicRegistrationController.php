<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegistrationController extends Controller
{
    public function store(Request $request)
    {
        $formationId = $request->input('formation_id') ?? $request->input('formationId');
        if (!$formationId) {
            throw ValidationException::withMessages(['formation_id' => 'formation_id est requis']);
        }

        $formation = Formation::query()->where('active', true)->findOrFail($formationId);

        $user = $request->user();

        if ($user) {
            if (method_exists($user, 'hasRole') && !$user->hasRole('Client')) {
                return response()->json(['message' => 'Seuls les utilisateurs Client peuvent s’inscrire.'], 403);
            }
        } else {
            $data = $request->validate([
                'email' => ['required', 'email'],
                'first_name' => ['required', 'string'],
                'last_name' => ['required', 'string'],
                'phone' => ['nullable', 'string'],
            ]);

            $user = User::query()->where('email', $data['email'])->first();
            if (!$user) {
                $user = new User();
                $user->name = trim($data['first_name'] . ' ' . $data['last_name']);
                $user->email = $data['email'];
                $user->password = Hash::make(Str::random(16));
                if (in_array('phone', $user->getFillable()) || property_exists($user, 'phone')) {
                    $user->phone = $data['phone'] ?? null;
                }
                $user->save();
                if (method_exists($user, 'assignRole')) {
                    try {
                        $user->assignRole('Client');
                    } catch (\Throwable $e) {
                    }
                }
            }
        }

        $exists = Registration::query()
            ->where('formation_id', $formation->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Déjà inscrit à cette formation'], 422);
        }

        $taken = Registration::query()
            ->where('formation_id', $formation->id)
            ->count();

        if ($formation->max_participants !== null && $formation->max_participants > 0 && $taken >= $formation->max_participants) {
            return response()->json(['message' => 'Nombre de places atteint'], 422);
        }

        $amount = null;
        if (($formation->price_type ?? null) === 'fixed' && !is_null($formation->price_cfa) && $formation->price_cfa > 0) {
            $amount = (int) $formation->price_cfa;
        }

        $registration = Registration::create([
            'formation_id' => $formation->id,
            'user_id' => $user->id,
            'status' => 'confirmed',
            'amount_cfa' => $amount,
            'price_type' => $formation->price_type,
        ]);

        return response()->json([
            'id' => $registration->id,
            'status' => $registration->status,
            'amount_cfa' => $registration->amount_cfa,
            'formation' => [
                'id' => $formation->id,
                'title' => $formation->title,
                'date' => $formation->date,
                'type' => $formation->type,
                'price_type' => $formation->price_type,
                'price_cfa' => $formation->price_cfa,
            ],
        ], 201);
    }

    public function mine(Request $request)
    {
        $user = $request->user();
        $items = Registration::query()
            ->where('user_id', $user->id)
            ->with('formation')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'status' => $r->status,
                    'amount_cfa' => $r->amount_cfa,
                    'formation' => [
                        'id' => $r->formation->id,
                        'title' => $r->formation->title,
                        'date' => $r->formation->date,
                        'type' => $r->formation->type,
                    ],
                ];
            });

        return response()->json(['data' => $items]);
    }
}
