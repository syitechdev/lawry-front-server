<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\Registration;
use App\Models\RegistrationItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PublicRegistrationController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'guest' => ['nullable', 'array'],
            'guest.first_name' => ['nullable', 'string'],
            'guest.last_name' => ['nullable', 'string'],
            'guest.email' => ['nullable', 'email'],
            'guest.phone' => ['nullable', 'string'],
            'guest.profession' => ['nullable', 'string'],
            'guest.company' => ['nullable', 'string'],
            'formations' => ['required', 'array', 'min:1'],
            'formations.*' => ['integer', 'exists:formations,id'],
            'preferences' => ['required', 'array'],
            'preferences.session_format' => ['required', 'in:presentiel,distanciel,mixte'],
            'preferences.preferred_dates' => ['nullable', 'string'],
            'preferences.motivation' => ['required', 'string', 'min:10'],
            'preferences.specific_needs' => ['nullable', 'string'],
            'total_price' => ['nullable', 'integer'],
            'payment_required' => ['nullable', 'boolean'],
        ]);

        $userId = auth()->id() ?: ($data['user_id'] ?? null);

        if (!$userId && !empty($data['guest']['email'])) {
            $user = User::where('email', $data['guest']['email'])->first();
            if (!$user) {
                $user = User::create([
                    'name' => trim(($data['guest']['first_name'] ?? '') . ' ' . ($data['guest']['last_name'] ?? '')) ?: ($data['guest']['email'] ?? 'Utilisateur'),
                    'email' => $data['guest']['email'],
                    'password' => Hash::make(Str::random(32)),
                ]);
            }
            $userId = $user->id;
        }

        return DB::transaction(function () use ($data, $userId) {
            $formations = Formation::whereIn('id', $data['formations'])->get();
            $computedTotal = 0;
            foreach ($formations as $f) {
                if ($f->price_type === 'fixed' && $f->price_cfa && $f->price_cfa > 0) {
                    $computedTotal += (int) $f->price_cfa;
                }
            }
            $total = $data['total_price'] ?? $computedTotal;
            $paymentRequired = $data['payment_required'] ?? ($total > 0);

            $registration = Registration::create([
                'user_id' => $userId,
                'guest' => $userId ? null : ($data['guest'] ?? null),
                'preferences' => $data['preferences'] ?? null,
                'total_price' => $total,
                'payment_required' => (bool) $paymentRequired,
                'status' => $paymentRequired ? 'payment_required' : 'confirmed',
            ]);

            foreach ($formations as $f) {
                RegistrationItem::create([
                    'registration_id' => $registration->id,
                    'formation_id' => $f->id,
                    'price_cfa' => ($f->price_type === 'fixed' && $f->price_cfa) ? (int) $f->price_cfa : null,
                ]);
            }

            return response()->json([
                'id' => $registration->id,
                'status' => $registration->status,
                'total_price' => $registration->total_price,
                'payment_required' => $registration->payment_required,
            ], 201);
        });
    }
}
