<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'Admin']);
        Role::firstOrCreate(['name' => 'Client']);

        $admin = User::firstOrCreate(
            ['email' => 'admin@lawry.ci'],
            [
                'name' => 'Admin Lawry',
                'password' => 'admin123',
            ]
        );

        // Assigne role Admin
        $admin->syncRoles('Admin');
    }
}
