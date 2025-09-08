<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PaymentInvoiceData;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PaymentInvoiceController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $u = $request->user();

        $items = Payment::query()
            ->select(['id', 'reference', 'amount', 'currency', 'status', 'created_at', 'paid_at'])
            ->where(function ($q) use ($u) {
                $q->where('customer_email', $u->email)
                    ->orWhere('meta->user_id', $u->id);
            })
            ->latest('id')
            ->get();

        return response()->json($items);
    }

    public function summary(Request $request, Payment $payment, PaymentInvoiceData $builder)
    {
        $this->authorize('view', $payment);
        return response()->json($builder->build($payment));
    }

    public function invoice(Request $request, Payment $payment, PaymentInvoiceData $builder)
    {
        $this->authorize('view', $payment);
        abort_unless($payment->status === Payment::S_OK, 403, 'Paiement non payé');

        $data = $builder->build($payment);

        $pdf = Pdf::loadView('pdf.invoice', [
            'data'        => $data,
            'generatedAt' => now(),
        ])
            ->setPaper('a4')
            ->setWarnings(false)
            ->setOptions([
                'enable_remote'       => true,
                'enable_html5_parser' => true,
            ]);

        return $pdf->stream('FAC-' . $payment->reference . '.pdf', ['Attachment' => false]);
    }
}
