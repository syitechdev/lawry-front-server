<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

if (app()->environment('local')) {
    Route::get('/_preview/email/files/{id}', function ($id) {
        $p = \App\Models\Purchase::findOrFail($id);
        return view('emails.purchases.files', ['purchase' => $p, 'links' => $p->product_snapshot['files_urls'] ?? []]);
    });
    Route::get('/_preview/email/service/{id}', function ($id) {
        $p = \App\Models\Purchase::findOrFail($id);
        return view('emails.purchases.service', ['purchase' => $p]);
    });
}
