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
            'payable_type' => $payable->getMorphClass(),
            'payable_id'   => $id,
            'provider'     => 'paiementpro',
        ])->whereIn('status', [
            Payment::S_PENDING,
            Payment::S_INITIATED,
            Payment::S_PROCESS,
        ])->latest('id')->first();

        if ($existing && $existing->session_id && (!$existing->expires_at || now()->lt($existing->expires_at))) {
            return response()->json([
                'method'     => 'GET',
                'action'     => $pp->processingUrl(),
                'fields'     => ['sessionId' => $existing->session_id, 'sessionid' => $existing->session_id],
                'sessionId'  => $existing->session_id,
                'sessionid'  => $existing->session_id,
                'reference'  => $existing->reference,
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
            'payable_type'        => $payable->getMorphClass(),
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
            'returnURL'           => rtrim(config('app.frontend_url'), '/') . '/payment/return',
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

        try {
            if (method_exists($payable, 'onPaymentPending')) {
                $payable->onPaymentPending($payment);
            }
        } catch (\Throwable $e) {
        }

        return response()->json([
            'method'     => 'GET',
            'action'     => $pp->processingUrl(),
            'fields'     => ['sessionId' => $sessionId, 'sessionid' => $sessionId],
            'sessionId'  => $sessionId,
            'sessionid'  => $sessionId,
            'reference'  => $payment->reference,
        ]);
    }

    public function webhook(Request $request)
    {
        $payload = $request->all();

        $reference    = (string) ($payload['referenceNumber'] ?? '');
        $responsecode = strtoupper((string) ($payload['responsecode'] ?? ''));
        $message      = (string) ($payload['message'] ?? '');

        $payment = Payment::where('reference', $reference)->firstOrFail();

        if ($payment->isTerminal()) {
            return response()->json(['ok' => true]);
        }

        if (isset($payload['amount']) && (int) $payload['amount'] !== (int) $payment->amount) {
            return response()->json(['error' => 'amount_mismatch'], 400);
        }

        if ($responsecode === '0') {
            $payment->markSucceeded('0', $message);
            try {
                optional($payment->payable)->onPaymentSucceeded($payment);
            } catch (\Throwable $e) {
            }
        } elseif (in_array($responsecode, ['-1', '1001', '1002'], true)) {
            $payment->markFailed($responsecode, $message ?: 'Transaction échouée');
            try {
                if (method_exists($payment->payable, 'onPaymentFailed')) {
                    $payment->payable->onPaymentFailed($payment);
                }
            } catch (\Throwable $e) {
            }
        } elseif ($responsecode === 'CANCEL') {
            $payment->markCancelled('CANCEL', $message ?: 'Transaction annulée');
            try {
                if (method_exists($payment->payable, 'onPaymentFailed')) {
                    $payment->payable->onPaymentFailed($payment);
                }
            } catch (\Throwable $e) {
            }
        } elseif ($responsecode === 'EXPIRED') {
            $payment->markExpired('EXPIRED', $message ?: 'Session expirée');
            try {
                if (method_exists($payment->payable, 'onPaymentFailed')) {
                    $payment->payable->onPaymentFailed($payment);
                }
            } catch (\Throwable $e) {
            }
        } else {
            $payment->markFailed($responsecode, $message ?: 'Statut inconnu');
            try {
                if (method_exists($payment->payable, 'onPaymentFailed')) {
                    $payment->payable->onPaymentFailed($payment);
                }
            } catch (\Throwable $e) {
            }
        }

        return response()->json(['ok' => true]);
    }

    public function return(Request $request)
    {
        $payload   = $request->all() + $request->query();
        $refRaw    = (string) ($payload['reference'] ?? $payload['referenceNumber'] ?? '');
        $refRaw    = urldecode($refRaw);
        $reference = $refRaw !== '' ? preg_replace('/[?&].*$/', '', $refRaw) : '';
        $sessionId = (string) ($payload['sessionId'] ?? $payload['sessionid'] ?? '');
        $respCode  = strtoupper((string) ($payload['responsecode'] ?? ''));
        $message   = (string) ($payload['message'] ?? '');

        $payment = null;
        if ($reference !== '') $payment = Payment::where('reference', $reference)->first();
        if (!$payment && $sessionId !== '') $payment = Payment::where('session_id', $sessionId)->first();

        if ($payment && !$payment->isTerminal() && $respCode !== '') {
            if ($respCode === '0') {
                $payment->markSucceeded('0', $message);
                try {
                    optional($payment->payable)->onPaymentSucceeded($payment);
                } catch (\Throwable $e) {
                }
            } elseif (in_array($respCode, ['-1', '1001', '1002'], true)) {
                $payment->markFailed($respCode, $message ?: 'Transaction échouée');
                try {
                    if (method_exists($payment->payable, 'onPaymentFailed')) {
                        $payment->payable->onPaymentFailed($payment);
                    }
                } catch (\Throwable $e) {
                }
            } elseif ($respCode === 'CANCEL') {
                $payment->markCancelled('CANCEL', $message ?: 'Transaction annulée');
                try {
                    if (method_exists($payment->payable, 'onPaymentFailed')) {
                        $payment->payable->onPaymentFailed($payment);
                    }
                } catch (\Throwable $e) {
                }
            } elseif ($respCode === 'EXPIRED') {
                $payment->markExpired('EXPIRED', $message ?: 'Session expirée');
                try {
                    if (method_exists($payment->payable, 'onPaymentFailed')) {
                        $payment->payable->onPaymentFailed($payment);
                    }
                } catch (\Throwable $e) {
                }
            } else {
                $payment->markFailed($respCode, $message ?: 'Statut inconnu');
                try {
                    if (method_exists($payment->payable, 'onPaymentFailed')) {
                        $payment->payable->onPaymentFailed($payment);
                    }
                } catch (\Throwable $e) {
                }
            }
        }

        return response()->json([
            'reference' => $payment?->reference ?? $reference,
            'status'    => $payment?->status ?? 'unknown',
            'message'   => $payment?->response_message,
        ], $payment ? 200 : 404);
    }
}
