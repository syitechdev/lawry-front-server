<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = 'web';

        $permissions = [
            // === Console RBAC
            'rbac.manage',

            // Users
            'users.read',
            'users.create',
            'users.update',
            'users.delete',

            // Demandes
            'demandes.read',
            'demandes.update',
            'demandes.assign',
            'demandes.comment',
            'demandes.export',

            // Toggles / actions spécifiques
            'formations.toggle',
            'plans.toggle',
            'plans.popular.toggle',
            'boutiques.toggle',
            'boutiques.image.upload',
            'services.toggle',

            // Inscriptions (formations)
            'registrations.read',
            'registrations.mark',
            'registrations.export',

            // Types de demande (Request Types)
            'request-types.read',
            'request-types.create',
            'request-types.update',
            'request-types.toggle',
            'request-types.delete',

            // Blog / Articles

            'articles.create',
            'articles.read',
            'articles.update',
            'articles.delete',

            // Boutiques
            'boutiques.read',
            'boutiques.create',
            'boutiques.update',
            'boutiques.delete',

            // Catégories
            'categories.read',
            'categories.create',
            'categories.update',
            'categories.delete',

            // Types d'entreprise
            'enterprise-types.read',
            'enterprise-types.create',
            'enterprise-types.update',
            'enterprise-types.delete',

            // Formations
            'formations.read',
            'formations.create',
            'formations.update',
            'formations.delete',

            // Plans
            'plans.read',
            'plans.create',
            'plans.update',
            'plans.delete',

            // Services
            'services.read',
            'services.create',
            'services.update',
            'services.delete',

            // Tarifs
            'tarifs.read',
            'tarifs.create',
            'tarifs.update',
            'tarifs.delete',

            //contacts
            'contacts.read',
            'contacts.update',
            'contacts.delete',

            'newsletter.read',
            'newsletter.delete',

            'conseils.read',
            'conseils.update',
            'conseils.delete',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => $guard]);
        }

        $admin   = Role::firstOrCreate(['name' => 'Admin',   'guard_name' => $guard]);
        $client  = Role::firstOrCreate(['name' => 'Client',  'guard_name' => $guard]);
        $agent   = Role::firstOrCreate(['name' => 'Agent',   'guard_name' => $guard]);
        $manager = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => $guard]);

        // Admin a TOUT (y compris rbac.manage)
        $admin->syncPermissions(Permission::all());

        // Agent
        $agent->syncPermissions([
            'demandes.read',
            'demandes.update',
            'demandes.assign',
            'demandes.comment',
            'registrations.read',
            'registrations.mark',

            'contacts.read',
            'contacts.update',
        ]);

        // Manager
        $manager->syncPermissions([
            'users.read',
            'demandes.read',
            'demandes.update',
            'demandes.assign',
            'demandes.comment',
            'demandes.export',
            'registrations.read',
            'registrations.export',
            'request-types.read',
            'request-types.update',

            'contacts.read',
            'contacts.update',

            'newsletter.read',
            'newsletter.delete',

            'conseils.read',
            'conseils.update',
            'conseils.delete',

        ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
