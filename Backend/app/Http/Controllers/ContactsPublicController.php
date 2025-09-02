<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactRequest;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactsPublicController extends Controller
{
    public function store(StoreContactRequest $req)
    {
        $data = $req->validated();
        $contact = Contact::create([
            ...$data,
            'ip_address' => $req->ip(),
            'user_agent' => (string) ($req->header('User-Agent') ?? ''),
        ]);

        return (new ContactResource($contact))
            ->additional(['message' => 'Message reçu. Nous vous répondrons rapidement.'])
            ->response()
            ->setStatusCode(201);
    }
}
