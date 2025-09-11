@extends('emails.layouts.base', [
'headline' => 'Confirmation — ' . ($purchase->product_snapshot['name'] ?? 'Votre commande'),
'title' => ('Confirmation — ' . ($purchase->product_snapshot['name'] ?? 'Votre commande') . ' — ' . config('app.name')),
])

@section('content')
@php
$code = $purchase->product_snapshot['code'] ?? '—';
$desc = $purchase->product_snapshot['description'] ?? '—';
@endphp

<p style="margin:0 0 10px 0;">Bonjour,</p>

<p style="margin:0 0 8px 0;">
    Référence : <strong>{{ $purchase->ref }}</strong><br />
    Montant : <strong>{{ number_format($purchase->unit_price_cfa, 0, ',', ' ') }} {{ $purchase->currency }}</strong>
</p>

<div style="margin:12px 0 0 0;">
    <div style="font-weight:600; margin-bottom:6px;">Détails :</div>
    <ul style="padding-left:18px; margin:0;">
        <li><strong>Code :</strong> {{ $code }}</li>
        <li><strong>Description :</strong> {{ $desc }}</li>
    </ul>
</div>

<p style="margin:16px 0 0 0;">Nous revenons vers vous rapidement pour la suite.</p>
@endsection