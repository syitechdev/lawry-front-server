<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Auth\UpdateSelfRequest;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Auth\Events\PasswordReset;



class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'phone'    => $data['phone'],
            'password' => $data['password'],
        ]);

        $user->syncRoles('Client');
        $token = $user->createToken('mobile', ['*'], now()->addDay())->plainTextToken;

        event(new Registered($user));

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides'], 422);
        }

        $user->forceFill(['last_activity_at' => now()])->saveQuietly();
        event(new Login('web', $user, false));

        $token = $user->createToken('mobile', ['*'], now()->addDay())->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user),
        ]);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function updateMe(UpdateSelfRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        if (isset($data['password'])) {
            if (empty($data['current_password']) || ! Hash::check($data['current_password'], $user->password)) {
                return response()->json(['message' => 'Mot de passe actuel invalide'], 422);
            }
            $user->password = $data['password'];
        }

        if (isset($data['name']))  $user->name  = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];

        $user->save();
        $user->refresh();

        return new \App\Http\Resources\UserResource($user);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );


        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Lien de réinitialisation envoyé à votre adresse email.']);
        } else {
            return response()->json(['message' => 'Email introuvable.'], 404);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));

                $user->tokens()->delete();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        }

        return response()->json(['message' => 'Le lien est invalide ou expiré.'], 400);
    }
}
