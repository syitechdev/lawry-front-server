<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RbacController extends Controller
{
    protected function isSystem(Role $role): bool
    {
        return in_array(strtolower($role->name), ['admin', 'client'], true);
    }

    protected function labelizeGroup(string $group): string
    {
        $g = str_replace(['-', '_'], ' ', $group);
        return mb_convert_case($g, MB_CASE_TITLE, "UTF-8");
    }

    protected function labelizeAction(string $action): string
    {
        return match ($action) {
            'read'            => 'Lire / Voir',
            'create'          => 'Créer / Ajouter',
            'update'          => 'Modifier',
            'delete'          => 'Supprimer',
            'toggle'          => 'Activer / Désactiver',
            'assign'          => 'Assigner',
            'comment'         => 'Commenter',
            'export'          => 'Exporter',
            'image.upload'    => 'Téléverser image',
            'popular.toggle'  => 'Basculer populaire',
            default           => ucfirst(str_replace('.', ' ', $action)),
        };
    }

    public function rolesIndex()
    {
        $roles = Role::query()->orderBy('name')->get()->map(function (Role $r) {
            return [
                'id'          => $r->id,
                'name'        => $r->name,
                'is_system'   => $this->isSystem($r),
                'permissions' => $r->permissions->pluck('name')->values(),
                'created_at'  => optional($r->created_at)->toIso8601String(),
                'updated_at'  => optional($r->updated_at)->toIso8601String(),
            ];
        });

        return response()->json($roles);
    }

    public function rolesStore(Request $request)
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'min:2', 'max:100', Rule::unique('roles', 'name')->where('guard_name', 'web')],
            'clone_from' => ['nullable', 'integer', 'exists:roles,id'],
        ]);

        $role = Role::create([
            'name'       => $data['name'],
            'guard_name' => 'web',
        ]);

        if (!empty($data['clone_from'])) {
            $from = Role::find($data['clone_from']);
            if ($from) {
                $role->syncPermissions($from->permissions->pluck('name')->all());
            }
        }

        return response()->json([
            'id'          => $role->id,
            'name'        => $role->name,
            'is_system'   => $this->isSystem($role),
            'permissions' => $role->permissions->pluck('name')->values(),
            'created_at'  => optional($role->created_at)->toIso8601String(),
            'updated_at'  => optional($role->updated_at)->toIso8601String(),
        ], 201);
    }

    public function rolesRename(Request $request, Role $role)
    {
        $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100', Rule::unique('roles', 'name')->where('guard_name', 'web')->ignore($role->id)],
        ]);

        if ($this->isSystem($role)) {
            return response()->json(['message' => 'Rôle système non modifiable.'], 422);
        }

        $role->update(['name' => $request->string('name')]);

        return response()->json([
            'id'        => $role->id,
            'name'      => $role->name,
            'is_system' => $this->isSystem($role),
        ]);
    }

    public function rolesDestroy(Role $role)
    {
        if ($this->isSystem($role)) {
            return response()->json(['message' => 'Rôle système non supprimable.'], 422);
        }

        $role->delete();

        return response()->json(['ok' => true]);
    }

    public function permissionsIndex()
    {
        $all = Permission::query()->orderBy('name')->get();

        $grouped = $all->groupBy(function (Permission $p) {
            return explode('.', $p->name, 2)[0] ?? $p->name;
        })->map(function ($items, $group) {
            $mapped = $items->map(function (Permission $p) {
                $parts  = explode('.', $p->name, 2);
                $action = $parts[1] ?? 'manage';
                return [
                    'name'   => $p->name,
                    'action' => $action,
                    'label'  => $this->labelizeAction($action),
                ];
            })->values();

            return [
                'group' => $group,
                'label' => $this->labelizeGroup($group),
                'items' => $mapped,
            ];
        })->values();

        return response()->json($grouped);
    }

    public function rolesSyncPermissions(Request $request, Role $role)
    {
        $data = $request->validate([
            'permissions'   => ['array'],
            'permissions.*' => ['string'],
        ]);

        $permNames = $data['permissions'] ?? [];

        $valid = Permission::whereIn('name', $permNames)->pluck('name')->all();
        $role->syncPermissions($valid);

        return response()->json(['ok' => true, 'permissions' => $valid]);
    }
}
