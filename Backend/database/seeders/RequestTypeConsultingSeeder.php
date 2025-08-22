<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RequestType;

class RequestTypeConsultingSeeder extends Seeder
{
    public function run(): void
    {
        RequestType::updateOrCreate(
            ['slug' => 'se-faire-conseiller'],
            [
                'name'         => 'Se faire conseiller',
                'version'      => 1,
                'is_active'    => true,
                'pricing_mode' => 'quote',
                'price_amount' => null,
                'currency'     => 'XOF',
                'variants_csv' => null,
                'features_csv' => null,
                'config'       => [
                    'variant_cards' => [
                        [
                            'key'          => 'phone-30',
                            'title'        => 'Consultation téléphonique',
                            'subtitle'     => 'Conseil juridique immédiat par téléphone',
                            'pricing_mode' => 'fixed',
                            'price_amount' => 25000,
                            'currency'     => 'XOF',
                            'badge'        => '30 minutes',
                            'features'     => [
                                'Réponse immédiate',
                                'Expert dédié',
                                'Suivi par email',
                            ],
                            'cta'          => 'Choisir cette formule',
                            'active'       => true,
                        ],
                    ],
                    'order' => ['phone-30'],
                ],
            ]
        );
    }
}
