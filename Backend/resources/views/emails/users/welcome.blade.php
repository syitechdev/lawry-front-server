<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bienvenue sur {{ config('app.name') }}</title>
</head>

<body
    style="margin:0; padding:0; width:100% !important; height:100% !important; -webkit-font-smoothing:antialiased; -webkit-text-size-adjust:none; background:#ffffff; color:#444444; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.45;">
    @php
    $appName = config('app.name', 'Lawri');
    $loginUrl = url('/login');
    /** @var \App\Models\User|null $user */
    $displayName = isset($user) && $user?->name ? $user->name : 'Bienvenue';
    $displayEmail = isset($user) ? $user->email : null;
    @endphp

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff"
        style="border-collapse:collapse;">
        <tr>
            <td align="center" style="padding:28px 16px;">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" align="center"
                    style="border:1px solid #7a0c0c; border-top-width:10px; border-top-left-radius:20px; border-top-right-radius:20px; border-collapse:separate; border-spacing:0; background:#ffffff;">
                    <tr>
                        <td align="center" style="padding:28px;">
                            <img src="https://lawry-conseilsci.com/lovable-uploads/58eeab48-482f-4e0a-ba88-27030b1aab79.png"
                                alt="{{ $appName }} logo" width="300"
                                style="display:block; border:0; outline:none; text-decoration:none;"
                                onerror="this.style.display='none'" />
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:0 24px 10px 24px;">
                            <div style="font-size:23px; font-weight:700; color:#222222; line-height:1.3;">
                                Bienvenue sur {{ $appName }} !
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td align="center"
                            style="padding:0 24px 8px 24px; color:#444444; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.45;">
                            <p style="margin:0 0 10px 0;">Bonjour {{ $displayName }},</p>
                            <p style="margin:0 0 16px 0;">
                                Merci de vous être inscrit(e) sur <strong>{{ $appName }}</strong>.
                                Votre compte a bien été créé et vous pouvez dès maintenant vous connecter.
                            </p>

                            <p style="margin:10px 0 0 0;">
                                <strong>Identifiant&nbsp;:</strong> {{ $displayEmail }}<br />
                                <strong>Mot de passe&nbsp;:</strong> *******<br />
                            </p>

                            <p style="margin:24px 0 0 0;">
                                <a href="{{ $loginUrl }}"
                                    style="display:inline-block; background:#7a0c0c; color:#ffffff !important; text-decoration:none; padding:14px 22px; border-radius:6px; font-weight:600; line-height:1;">
                                    Se connecter
                                </a>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding:16px 24px 28px 24px;">
                            <div
                                style="margin:0 0 10px 0; color:#444444; font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.45;">
                                Vous avez des questions ? Écrivez-nous à
                                <a href="mailto:support@{{ parse_url(config('app.url'), PHP_URL_HOST) ?? 'infos@syitech-group.com' }}"
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