<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class NewsletterAdminController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $req)
    {
        $this->authorize('newsletter.read');

        $q = (string) $req->query('q', '');
        $only = $req->query('only');

        $items = NewsletterSubscription::query()
            ->when($q, fn($qq) => $qq->where('email', 'like', '%' . $q . '%'))
            ->when($only === 'active', fn($qq) => $qq->active())
            ->when($only === 'unsub', fn($qq) => $qq->whereNotNull('unsubscribed_at'))
            ->latest('created_at')
            ->paginate((int)$req->query('per_page', 50))
            ->appends($req->query());

        return response()->json($items);
    }

    public function destroy(NewsletterSubscription $subscription)
    {
        $this->authorize('newsletter.delete');
        $subscription->delete();
        return response()->json(['message' => 'Enregistrement supprimé']);
    }

    public function stats()
    {
        $this->authorize('newsletter.read');

        $total = NewsletterSubscription::count();
        $active = NewsletterSubscription::active()->count();
        $unsub = NewsletterSubscription::whereNotNull('unsubscribed_at')->count();

        return response()->json([
            'total' => $total,
            'active' => $active,
            'unsubscribed' => $unsub,
        ]);
    }
}
