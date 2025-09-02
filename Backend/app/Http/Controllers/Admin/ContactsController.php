<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignContactRequest;
use App\Http\Requests\UpdateContactStatusRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;


class ContactsController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function index(Request $req)
    {
        $this->authorize('contacts.read');

        $q      = (string) $req->query('q', '');
        $status = $req->query('status');
        $isRead = $req->query('is_read');

        $items = Contact::query()
            ->search($q)
            ->status($status)
            ->when(!is_null($isRead), fn($qq) => $qq->where('is_read', (bool)$isRead))
            ->latest('created_at')
            ->paginate((int)$req->query('per_page', 20))
            ->appends($req->query());

        return ContactResource::collection($items);
    }

    public function show(Contact $contact)
    {
        $this->authorize('contacts.read');
        return new ContactResource($contact);
    }

    public function markRead(Request $req, Contact $contact)
    {
        $this->authorize('contacts.update');
        if (!$contact->is_read) {
            $contact->forceFill([
                'is_read' => true,
                'read_at' => now(),
                'read_by' => optional($req->user())->id,
            ])->save();
        }
        return new ContactResource($contact);
    }

    public function markUnread(Contact $contact)
    {
        $this->authorize('contacts.update');
        $contact->forceFill([
            'is_read' => false,
            'read_at' => null,
            'read_by' => null,
        ])->save();

        return new ContactResource($contact);
    }

    public function updateStatus(UpdateContactStatusRequest $req, Contact $contact)
    {
        $this->authorize('contacts.update');
        $status = $req->validated('status');

        $contact->status = $status;
        if (in_array($status, ['traite', 'clos'])) {
            $contact->handled_at = now();
        }
        $contact->save();

        return new ContactResource($contact);
    }

    public function assign(AssignContactRequest $req, Contact $contact)
    {
        $this->authorize('contacts.update');
        $contact->assigned_to = $req->validated('assigned_to');
        $contact->save();

        return new ContactResource($contact);
    }

    public function destroy(Contact $contact)
    {
        $this->authorize('contacts.delete');
        $contact->delete();
        return response()->json(['message' => 'Contact supprimé']);
    }

    public function stats()
    {
        $this->authorize('contacts.read');

        $total   = Contact::count();
        $unread  = Contact::where('is_read', false)->count();
        $byStatus = Contact::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'total'   => $total,
            'unread'  => $unread,
            'byStatus' => $byStatus,
        ]);
    }
}
