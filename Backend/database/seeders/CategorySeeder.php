<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!DB::table('categories')->where('id', 1)->exists()) {
            DB::table('categories')->insert([
                'id' => 1,
                'name' => 'Général',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
