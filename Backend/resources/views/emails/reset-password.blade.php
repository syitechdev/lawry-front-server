<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Réinitialisation du mot de passe — {{ $appName ?? config('app.name') }}</title>
</head>

<body style="margin:0; padding:0; width:100% !important; height:100% !important; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none; background:#ffffff; color:#444444; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.45;">
    @php
    /** @var \App\Models\User|null $user */
    $user = $user ?? null;
    $appName = $appName ?? config('app.name', 'Lawry');
    $display = $user?->name ?: 'Bonjour';
    $email = $user?->email;
    $expires = $expires ?? (config('auth.passwords.' . config('auth.defaults.passwords') . '.expire') ?? 60);
    $resetUrl = $resetUrl ?? '#';
    @endphp

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff" style="border-collapse:collapse;">
        <tr>
            <td align="center" style="padding:28px 16px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" align="center"
                    style="border:1px solid #7a0c0c; border-top-width:10px; border-top-left-radius:20px; border-top-right-radius:20px; border-collapse:separate; border-spacing:0; background:#ffffff;">
                    <tr>
                        <td align="center" style="padding:28px;">
                            <img src="https://syitech-group.com/lovable-uploads/cfc4a0de-7b60-4b99-bebb-20e1c30a5c4a.png"
                                alt="{{ $appName }} logo" width="250"
                                style="display:block; border:0; outline:none; text-decoration:none;"
                                onerror="this.style.display='none'" />
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:0 24px 10px 24px;">
                            <div style="font-size:23px; font-weight:700; color:#222222; line-height:1.3;">
                                Réinitialisation de votre mot de passe
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:0 24px 8px 24px; color:#444444; font-size:16px; line-height:1.45;">
                            <p style="margin:0 0 10px 0;">{{ $display }},</p>
                            <p style="margin:0 0 16px 0;">
                                Vous recevez cet e-mail car nous avons reçu une demande de réinitialisation du mot de passe
                                pour votre compte <strong>{{ $appName }}</strong>.
                            </p>

                            @if($email)
                            <p style="margin:0 0 6px 0;"><strong>Identifiant&nbsp;:</strong> {{ $email }}</p>
                            @endif

                            <p style="margin:18px 0 0 0;">
                                <a href="{{ $resetUrl }}"
                                    style="display:inline-block; background:#7a0c0c; color:#ffffff !important; text-decoration:none; padding:14px 22px; border-radius:6px; font-weight:600; line-height:1;">
                                    Réinitialiser mon mot de passe
                                </a>
                            </p>

                            <p style="margin:16px 0 0 0; font-size:14px; color:#666666;">
                                Ce lien expirera dans {{ $expires }} minutes. Si vous n’êtes pas à l’origine de cette demande,
                                vous pouvez ignorer cet e-mail.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:16px 24px 28px 24px;">
                            <div style="margin:0 0 10px 0; color:#444444; font-size:16px; line-height:1.45;">
                                Besoin d’aide ? Écrivez-nous à
                                <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) ?? 'lawry.ci' }}"
                                    style="color:#7a0c0c; text-decoration:none;">support</a>.
                            </div>
                            <div style="color:#777777; font-size:13px; line-height:1.45;">
                                © {{ date('Y') }} {{ $appName }} — Tous droits réservés.
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>