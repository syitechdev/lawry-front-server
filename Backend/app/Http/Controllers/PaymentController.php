<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function init(Request $request, string $type, int $id)
    {
        // sécurité : type autorisé via morphMap
        $class = Relation::getMorphedModel($type);
        abort_unless($class, 404, 'Type de paiement inconnu');

        $payable = $class::findOrFail($id);

        // Montant + référence stable/idempotente
        $amount = (int) $payable->payableAmountXof();
        $reference = strtoupper($type) . '-' . now()->format('Ymd') . '-' . Str::padLeft((string)$id, 6, '0');

        // Crée la ligne Payment (status pending → initiated)
        $payment = Payment::create([
            'payable_type' => $class,
            'payable_id'   => $payable->getKey(),
            'reference'    => $reference,
            'amount'       => $amount,
            'currency'     => 'XOF',
            'provider'     => 'paiementpro',
            'status'       => Payment::S_PENDING,
            'meta'         => ['type' => $type],
        ]);

        // ▶︎ Appel initTransact PaiementPro (à brancher avec ton service SOAP)
        // $sessionId = app(PaiementPro::class)->initTransact([...]);
        // $payment->update(['session_id' => $sessionId, 'status' => Payment::S_INITIATED, 'initialized_at' => now()]);
        // $redirectUrl = app(PaiementPro::class)->buildRedirectUrl($sessionId);

        // En attendant le service, renversons une URL factice
        $redirectUrl = 'https://paiementpro.net/processing_v2.php?SessionID=...';

        return response()->json([
            'redirect_url' => $redirectUrl,
            'reference'    => $payment->reference,
        ]);
    }

    public function webhook(Request $request)
    {
        $reference = $request->input('referenceNumber');
        $code      = (string) $request->input('responsecode');
        $message   = $request->input('message');

        $payment = Payment::where('reference', $reference)->firstOrFail();

        if (in_array($payment->status, [Payment::S_OK, Payment::S_FAIL, Payment::S_CANCEL, Payment::S_EXPIRE])) {
            return response()->json(['ok' => true]);
        }

        if ($code === '0') {
            $payment->markSucceeded($code, $message);
            $payment->payable->onPaymentSucceeded($payment);
        } elseif ($code === '-1') {
            $payment->forceFill([
                'status' => Payment::S_FAIL,
                'response_code' => $code,
                'response_message' => $message,
            ])->save();
        } else {
            $payment->forceFill([
                'status' => Payment::S_FAIL,
                'response_code' => $code,
                'response_message' => $message,
            ])->save();
        }

        return response()->json(['ok' => true]);
    }

    public function return(Request $request)
    {

        $reference = $request->query('reference');
        $payment = Payment::where('reference', $reference)->first();

        return response()->json([
            'reference' => $reference,
            'status'    => optional($payment)->status ?? 'unknown',
        ]);
    }
}
