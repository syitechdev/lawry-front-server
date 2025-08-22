<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RequestType;


class RequestTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RequestType::updateOrCreate(
            ['slug' => 'contrat-travail'],
            [
                'name'         => 'Contrat de travail',
                'version'      => 1,
                'is_active'    => true,
                'pricing_mode' => 'from',
                'price_amount' => 75000,
                'currency'     => 'XOF',
                'variants_csv' => 'CDI, CDD, Stage, Freelance',
                'features_csv' => 'Clauses personnalisées, Conforme au droit ivoirien, Révision incluse',
                'config'       => ['ui' => ['color' => '#7b1d1b', 'icon' => 'file-signature']],
            ]
        );
    }
}
