<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'name' => 'Essai Gratuit',
                'monthly_price_cfa' => 0,
                'yearly_price_cfa'  => 0,
                'is_trial'          => true,
                'trial_days'        => 14,
                'popular'           => false,
                'is_active'         => true,
                'features'          => [
                    '5 consultations juridiques en ligne (25 min)',
                    'Assistance par téléphone ou email',
                ],
                'gradient_from'     => 'from-green-400',
                'gradient_to'       => 'to-green-500',
                'sort_index'        => 0,
                'color'             => 'green',
            ],
            [
                'name' => 'Basic',
                'monthly_price_cfa' => 24999,
                'yearly_price_cfa'  => 249990,
                'is_trial'          => false,
                'popular'           => false,
                'is_active'         => true,
                'features'          => [
                    'Une consultation juridique par mois',
                    'Assistance par téléphone ou email',
                    'Réponse sous 48h ouvrables',
                ],
                'gradient_from'     => 'from-gray-400',
                'gradient_to'       => 'to-gray-500',
                'sort_index'        => 1,
                'color'             => 'gray',
            ],
            [
                'name' => 'Premium',
                'monthly_price_cfa' => 49950,
                'yearly_price_cfa'  => 499500,
                'is_trial'          => false,
                'popular'           => true,
                'is_active'         => true,
                'features'          => [
                    'Trois consultations juridiques par mois',
                    'Assistance prioritaire par téléphone ou email',
                    'Réponse sous 24h',
                    'Analyse succincte de documents juridiques',
                ],
                'gradient_from'     => 'from-blue-500',
                'gradient_to'       => 'to-blue-600',
                'sort_index'        => 2,
                'color'             => 'blue',
            ],
        ];

        foreach ($rows as $i => $row) {
            Plan::updateOrCreate(
                ['name' => $row['name']],
                $row + ['code' => null, 'slug' => null]
            );
        }
    }
}
