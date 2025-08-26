<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use App\Models\RequestType;

class RequestTypeCreateEntrepriseSeeder extends Seeder
{
    public function run(): void
    {
        $payload = [
            'name'          => 'Créer une entreprise',
            'slug'          => 'creer-entreprise',
            'version'       => 1,
            'is_active'     => true,
            'pricing_mode'  => 'quote',
            'price_amount'  => null,
            'currency'      => 'XOF',
            'variants_csv'  => null,
            'features_csv'  => null,
            'config'        => [
                'managed_by'    => 'enterprise_types',
                'order'         => [],
                'variant_cards' => [],
            ],
        ];

        $rt = RequestType::where('slug', 'creer-entreprise')->first();

        if ($rt) {
            $rt->fill(Arr::only($payload, [
                'name',
                'version',
                'is_active',
                'currency'
            ]));

            if (empty($rt->pricing_mode)) {
                $rt->pricing_mode = 'quote';
            }

            $cfg = is_array($rt->config) ? $rt->config : [];
            $cfg['managed_by']    = $cfg['managed_by']    ?? 'enterprise_types';
            $cfg['order']         = $cfg['order']         ?? [];
            $cfg['variant_cards'] = $cfg['variant_cards'] ?? [];
            $rt->config = $cfg;

            $rt->save();
        } else {
            RequestType::create($payload);
        }

        $this->command?->info('RequestType "creer-entreprise" prêt.');
    }
}
