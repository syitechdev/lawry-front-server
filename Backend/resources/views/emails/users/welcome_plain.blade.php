Bonjour {{ isset($user) && $user?->name ? $user->name : 'utilisateur' }},

Bienvenue sur {{ config('app.name') }} !

Votre compte a bien été créé.
Identifiant : {{ $user->email ?? '' }}

Connectez-vous ici : {{ url('/login') }}

Si vous n’êtes pas à l’origine de cette inscription, ignorez cet e-mail.

— L’équipe {{ config('app.name') }}