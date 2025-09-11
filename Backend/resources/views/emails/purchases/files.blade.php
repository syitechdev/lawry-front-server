@extends('emails.layouts.base', [
'headline' => 'Vos fichiers — ' . ($purchase->product_snapshot['name'] ?? 'Votre achat'),
'title' => ('Vos fichiers — ' . ($purchase->product_snapshot['name'] ?? 'Votre achat') . ' — ' . config('app.name')),
])

@section('content')
<p style="margin:0 0 10px 0;">Bonjour,</p>
<p style="margin:0 0 8px 0;">
    Référence : <strong>{{ $purchase->ref }}</strong><br />
    Montant : <strong>{{ number_format($purchase->unit_price_cfa, 0, ',', ' ') }} {{ $purchase->currency }}</strong>
</p>
<p style="margin:12px 0 0 0;">
    Les fichiers sont envoyés en <strong>pièces jointes</strong>.
</p>
@endsection