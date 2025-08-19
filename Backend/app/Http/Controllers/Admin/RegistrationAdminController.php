<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\Formation;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RegistrationAdminController extends Controller
{
    public function index(Request $req)
    {
        $q = \App\Models\Registration::with(['user', 'formation'])->latest();

        $formationId = (int) $req->query('formation_id', 0);
        if ($formationId > 0) {
            $q->where('formation_id', $formationId);
        }

        if ($status = $req->query('status')) {
            $q->where('status', $status);
        }

        if ($search = $req->query('q')) {
            $q->whereHas('user', function ($s) use ($search) {
                $s->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
                    ->orWhere('phone', 'like', "%$search%");
            });
        }

        $rows = $q->get()->map(function ($r) {
            $first = trim(str($r->user->name ?? '')->before(' '));
            $last  = trim(str($r->user->name ?? '')->after(' '));
            return [
                'id' => $r->id,
                'formation_id' => $r->formation_id,
                'formation_title' => optional($r->formation)->title,
                'created_at' => $r->created_at?->toISOString(),
                'status' => $r->status,
                'first_name' => $first,
                'last_name'  => $last,
                'email' => $r->user->email ?? null,
                'phone' => $r->user->phone ?? null,
                'experience' => $r->experience,
                'session_format' => $r->session_format,
                'read_at' => $r->read_at,
            ];
        });

        return response()->json(['items' => $rows, 'total' => $rows->count()]);
    }


    public function markRead($id)
    {
        $r = Registration::findOrFail($id);
        if (!$r->read_at) {
            $r->read_at = now();
            $r->save();
        }
        return response()->json(['message' => 'ok']);
    }
    public function unreadCount(Request $request)
    {
        $count = Registration::query()->whereNull('read_at')->count();
        return response()->json(['count' => $count]);
    }
    public function export(Request $req): StreamedResponse
    {
        $formationId = (int)$req->query('formation_id');
        abort_unless($formationId > 0, 422, 'formation_id requis');

        $filename = "inscriptions_formation_{$formationId}.csv";

        $q = Registration::with('user')->where('formation_id', $formationId)->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        return response()->stream(function () use ($q) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['ID', 'Nom', 'Email', 'Téléphone', 'Statut', 'Format', 'Niveau', 'Date']);
            foreach ($q as $r) {
                fputcsv($out, [
                    $r->id,
                    $r->user->name,
                    $r->user->email,
                    $r->user->phone,
                    $r->status,
                    $r->session_format,
                    $r->experience,
                    optional($r->created_at)->toDateTimeString(),
                ]);
            }
            fclose($out);
        }, 200, $headers);
    }

    public function showFormation($id)
    {
        $f = Formation::findOrFail($id);
        return response()->json([
            'id' => $f->id,
            'title' => $f->title,
            'date' => $f->date,
            'max_participants' => $f->max_participants,
            'registrations_count' => Registration::where('formation_id', $f->id)->count(),
        ]);
    }

    public function show($id)
    {
        $r = \App\Models\Registration::with(['user', 'formation'])->findOrFail($id);
        $form = $r->formation;
        $formationCode = $form->code ?? ('FORM' . str_pad((string)$form->id, 3, '0', STR_PAD_LEFT));

        return response()->json([
            'id'             => $r->id,
            'created_at'     => optional($r->created_at)->toISOString(),
            'read_at'        => optional($r->read_at)->toISOString(),
            'status'         => $r->status,
            'experience'     => $r->experience,
            'session_format' => $r->session_format,

            'user' => [
                'id'         => $r->user->id,
                'name'       => $r->user->name,
                'email'      => $r->user->email ?? null,
                'phone'      => $r->user->phone ?? null,
                'created_at' => optional($r->user->created_at)->toISOString(),
            ],

            'formation' => [
                'id'         => $form->id,
                'title'      => $form->title,
                'code'       => $formationCode,
                'date'       => optional($form->date)->toISOString(),
                'type'       => $form->type,
                'level'      => $form->level,
                'duration'   => $form->duration,
                'price_type' => $form->price_type,
                'price_cfa'  => $form->price_cfa,
            ],
        ]);
    }

    public function update(\Illuminate\Http\Request $req, $id)
    {
        $r = \App\Models\Registration::findOrFail($id);

        $data = $req->validate([
            'status'         => ['nullable', 'in:pending,confirmed,cancelled'],
            'experience'     => ['nullable', 'in:debutant,intermediaire,avance'],
            'session_format' => ['nullable', 'in:presentiel,distanciel'],
        ]);

        $r->fill(array_filter($data, fn($v) => $v !== null));
        $r->save();

        return response()->json(['message' => 'updated']);
    }
}
