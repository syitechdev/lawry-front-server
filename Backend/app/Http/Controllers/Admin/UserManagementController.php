<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use App\Http\Requests\UserUpsertRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Events\Registered;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        if (! $request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Seul les admin peuvent voir la liste'], 403);
        }

        $q = (string) $request->query('q', '');
        $perPage = (int) $request->query('perPage', 15);
        $perPage = max(1, min($perPage, 100));

        $allowedSort = ['name', 'email', 'created_at'];
        $sort = in_array($request->query('sort'), $allowedSort) ? $request->query('sort') : 'created_at';
        $dir  = $request->query('dir') === 'asc' ? 'asc' : 'desc';

        $query = User::query()
            ->with('roles')
            ->when($q !== '', function ($qb) use ($q) {
                $qb->where(function ($w) use ($q) {
                    $w->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->orderBy($sort, $dir);

        $users = $query->paginate($perPage)->appends($request->query());

        return UserResource::collection($users);
    }

    public function createUser(\App\Http\Requests\UserUpsertRequest $request)
    {
        $data = $request->validated();

        $roles = $data['roles'] ?? (isset($data['role']) ? [$data['role']] : []);
        unset($data['roles'], $data['role']);

        $user = \App\Models\User::create($data);

        if (!empty($roles)) {
            $user->syncRoles($roles);
        }

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return new \App\Http\Resources\UserResource($user->fresh());
    }

    public function updateRole(\Illuminate\Http\Request $request, \App\Models\User $user)
    {
        $payload = $request->validate([
            'role'    => ['sometimes', 'string', \Illuminate\Validation\Rule::exists('roles', 'name')],
            'roles'   => ['sometimes', 'array'],
            'roles.*' => ['string', \Illuminate\Validation\Rule::exists('roles', 'name')],
        ]);

        $roles = $payload['roles'] ?? (isset($payload['role']) ? [$payload['role']] : []);
        $user->syncRoles($roles);

        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        return response()->json([
            'ok' => true,
            'roles' => $user->getRoleNames()->values(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values(),
        ]);
    }

    public function update(UserUpsertRequest $request, User $user)
    {
        // Admin only
        if (! $request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validated();

        if (array_key_exists('phone', $data)) {
            $user->phone = $data['phone'];
        }
        if (array_key_exists('address', $data)) {
            $user->address = $data['address'];
        }

        $user->fill($data);
        $user->save();

        if (!empty($data['role'])) {
            if ($user->hasRole('Admin') && $data['role'] === 'Client') {
                $otherAdmins = User::role('Admin')->where('id', '!=', $user->id)->count();
                if ($otherAdmins === 0) {
                    return response()->json(['message' => 'Impossible de retirer le dernier Admin'], 422);
                }
            }
            if ($request->user()->id === $user->id && $data['role'] === 'Client') {
                $otherAdmins = User::role('Admin')->where('id', '!=', $user->id)->count();
                if ($otherAdmins === 0) {
                    return response()->json(['message' => 'Vous ne pouvez pas vous retirer si vous êtes le seul Admin'], 422);
                }
            }

            $role = Role::findByName($data['role'], 'web');
            $user->syncRoles([$role]);
        }

        $user->refresh()->load('roles');

        return response()->json([
            'message' => 'User updated',
            'user'    => new UserResource($user),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if (! $request->user()->hasRole('Admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas vous supprimer vous-même'], 422);
        }

        if ($user->hasRole('Admin')) {
            $otherAdmins = \App\Models\User::role('Admin')->where('id', '!=', $user->id)->count();
            if ($otherAdmins === 0) {
                return response()->json(['message' => 'Impossible de supprimer le dernier Admin'], 422);
            }
        }

        // 🔒 VERROU : l'utilisateur a-t-il déjà utilisé un “service” ?
        // (subscription, formation, demande … extensible)
        if ($this->userHasAnyServiceUsage($user)) {
            return response()->json([
                'message' => 'Ce client a déjà utilisé des services (abonnement/demande/formation…). Suppression interdite.'
            ], 422);
        }

        $payload = [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'was_admin' => $user->hasRole('Admin'),
        ];

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès.',
            'user'    => $payload
        ], 200);
    }

    /**
     * Retourne true si l'utilisateur possède au moins un service (passé ou présent).
     * Types couverts : subscription, formation, demande (extensible).
     */
    private function userHasAnyServiceUsage(\App\Models\User $user): bool
    {
        // Liste des modèles “services” à vérifier (ajoute ici tes futurs types)
        $serviceModels = [
            \App\Models\Subscription::class,
            // Ajoute si existants dans ton app :
            \App\Models\Formation::class,
            \App\Models\Demande::class,
        ];

        foreach ($serviceModels as $modelClass) {
            if (!class_exists($modelClass)) {
                continue;
            }
            $m = new $modelClass;
            $q = $modelClass::query();

            // Si la table a une colonne user_id, on filtre dessus.
            // Sinon, si une relation user() existe, on filtre via whereHas.
            $table = $m->getTable();
            if (\Illuminate\Support\Facades\Schema::hasColumn($table, 'user_id')) {
                $q->where("{$table}.user_id", $user->id);
            } elseif (method_exists($m, 'user')) {
                $q->whereHas('user', fn($uq) => $uq->where('users.id', $user->id));
            } else {
                // Rien à faire pour ce type si ni colonne ni relation.
                continue;
            }

            if ($q->exists()) {
                return true;
            }
        }

        return false;
    }
}
