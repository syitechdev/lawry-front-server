<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\Relation;

use App\Models\Payment;
use App\Services\PaiementProAdapter;
use App\Services\PaiementProSigner;

class PaymentController extends Controller
{
    public function init(
        Request $request,
        string $type,
        int $id,
        PaiementProAdapter $pp,
        PaiementProSigner $signer
    ) {
        $class = Relation::getMorphedModel($type);
        abort_unless($class, 404, 'Type de paiement inconnu');

        $payable = $class::findOrFail($id);
        $user    = $request->user();

        $amount = (int) $payable->payableAmountXof();

        $baseRef = strtoupper($type) . '-' . now()->format('Ymd') . '-' . Str::padLeft((string)$id, 6, '0');

        $existing = Payment::where([
            'payable_type' => $class,
            'payable_id'   => $id,
            'provider'     => 'paiementpro',
        ])->whereIn('status', [
            Payment::S_PENDING,
            Payment::S_INITIATED,
            Payment::S_PROCESS,
        ])->latest('id')->first();

        if ($existing && $existing->session_id && (!$existing->expires_at || now()->lt($existing->expires_at))) {
            return response()->json([
                'method'    => 'GET',
                'action'    => $pp->processingUrl(),
                'fields'    => ['sessionid' => $existing->session_id],
                'sessionid'  => $existing->session_id,
                'reference' => $existing->reference,
            ]);
        }

        $reference = $baseRef;
        if (Payment::where('reference', $reference)->exists()) {
            $seq = Payment::where('reference', 'like', $baseRef . '%')->count() + 1;
            $reference = $baseRef . '-A' . Str::padLeft((string)$seq, 2, '0');
        }

        $customerEmail       = $request->input('customerEmail', optional($user)->email);
        $customerFirstName   = $request->input('customerFirstName', $user->first_name ?? ($user->name ?? 'Client'));
        $customerLastName    = $request->input('customerLastName',  $request->input('customerLastname', $user->last_name ?? ($user->name ?? 'Inconnu')));
        $customerPhoneNumber = $request->input('customerPhoneNumber', $user->phone ?? '00000000');

        if (!$customerEmail || !$customerFirstName || !$customerLastName || !$customerPhoneNumber) {
            return response()->json([
                'error'   => 'missing_customer_fields',
                'missing' => [
                    'customerEmail'       => (bool) $customerEmail,
                    'customerFirstName'   => (bool) $customerFirstName,
                    'customerLastName'    => (bool) $customerLastName,
                    'customerPhoneNumber' => (bool) $customerPhoneNumber,
                ],
            ], 422);
        }

        $payment = Payment::create([
            'payable_type'        => $class,
            'payable_id'          => $payable->getKey(),
            'reference'           => $reference,
            'amount'              => $amount,
            'currency'            => 'XOF',
            'provider'            => 'paiementpro',
            'status'              => Payment::S_PENDING,
            'channel'             => $request->string('channel')->toString() ?: null,
            'customer_email'      => $customerEmail,
            'customer_first_name' => $customerFirstName,
            'customer_last_name'  => $customerLastName,
            'customer_phone'      => $customerPhoneNumber,
            'meta'                => ['user_id' => optional($user)->id, 'type' => $type],
        ]);

        $payload = [
            'merchantId'          => config('services.paiementpro.merchant_id'),
            'referenceNumber'     => $reference,
            'amount'              => $amount,
            'customerEmail'       => $customerEmail,
            'customerFirstName'   => $customerFirstName,
            'customerLastName'    => $customerLastName,
            'customerPhoneNumber' => $customerPhoneNumber,
            'notificationURL'     => route('payments.webhook'),
            //'returnURL'           => route('payments.return'),
            'returnURL' => config('app.frontend_url') . 'payment/return',
            'countryCurrencyCode' => $pp->currencyCode(),
            'channel'             => $payment->channel,
            'description'         => $payable->payableLabel(),
            'returnContext'       => http_build_query(['type' => $type, 'id' => $id]),
        ];
        $payload['hashcode'] = $signer->compute($payload);

        $response = $pp->initTransact((object) $payload);

        if ((int)($response->Code ?? -1) !== 0) {
            $payment->update([
                'status'           => Payment::S_FAIL,
                'response_code'    => (string)($response->Code ?? '-1'),
                'response_message' => (string)($response->Description ?? 'Init error'),
            ]);
            return response()->json(['error' => 'init_failed', 'details' => $response], 422);
        }

        $sessionId = trim((string) $response->Sessionid);
        if ($sessionId === '') {
            $payment->update([
                'status'           => Payment::S_FAIL,
                'response_code'    => 'no_session',
                'response_message' => 'Sessionid vide',
            ]);
            return response()->json(['error' => 'init_failed', 'details' => ['Code' => 'no_session', 'Description' => 'Sessionid vide']], 422);
        }

        $payment->markInitiated($sessionId);

        return response()->json([
            'method'    => 'GET',
            'action'    => $pp->processingUrl(),
            'fields'    => ['sessionid' => $sessionId], //
            'reference' => $payment->reference,
        ]);
    }



    public function webhook(Request $request, PaiementProSigner $signer)
    {
        $payload = $request->all();

        if (!$signer->verify($payload)) {
            return response()->json(['error' => 'bad_signature'], 401);
        }

        $reference    = (string) ($payload['referenceNumber'] ?? '');
        $responsecode = (string) ($payload['responsecode'] ?? '');
        $message      = (string) ($payload['message'] ?? '');

        $payment = Payment::where('reference', $reference)->firstOrFail();

        if (in_array($payment->status, [Payment::S_OK, Payment::S_FAIL, Payment::S_CANCEL, Payment::S_EXPIRE], true)) {
            return response()->json(['ok' => true]);
        }

        if (isset($payload['amount']) && (int) $payload['amount'] !== (int) $payment->amount) {
            return response()->json(['error' => 'amount_mismatch'], 400);
        }

        if ($responsecode === '0') {
            $payment->markSucceeded('0', $message);
            $payment->payable->onPaymentSucceeded($payment);
        } elseif ($responsecode === '-1') {
            $payment->markFailed('-1', $message ?: 'Transaction échouée');
        } else {
            $payment->markFailed($responsecode, $message ?: 'Statut inconnu');
        }

        return response()->json(['ok' => true]);
    }

    public function return(Request $request)
    {
        $reference = (string) $request->query('reference', '');
        $payment   = Payment::where('reference', $reference)->first();

        return response()->json([
            'reference' => $reference,
            'status'    => $payment?->status ?? 'unknown',
            'message'   => $payment?->response_message,
        ]);
    }
}
