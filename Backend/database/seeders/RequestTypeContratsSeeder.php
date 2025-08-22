<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\RequestType;

class RequestTypeContratsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rt = RequestType::firstOrNew(['slug' => 'rediger-contrat']);
        $rt->name         = $rt->name ?? 'Rédiger un contrat';
        $rt->version      = $rt->version ?? 1;
        $rt->is_active    = true;
        $rt->pricing_mode = $rt->pricing_mode ?? 'from';
        $rt->price_amount = $rt->price_amount ?? 75000;
        $rt->currency     = $rt->currency ?? 'XOF';

        $rt->config = [
            'variants' => [
                [
                    'key'       => 'travail',
                    'title'     => 'Contrat de travail',
                    'subtitle'  => 'CDI, CDD, freelance… selon votre besoin',
                    'features'  => ['Clauses essentielles', 'Conforme au droit local'],
                    'active'    => true,
                    'order'     => 1,
                    'pricing_mode' => 'from',
                    'price_amount' => 75000,
                    'currency'     => 'XOF',

                    'form_schema' => [

                        ['name' => 'type_contrat', 'label' => 'Type de contrat', 'type' => 'select', 'options' => ['CDI', 'CDD', 'Freelance'], 'required' => true],

                        ['name' => 'parties', 'label' => 'Parties', 'type' => 'repeater', 'schema' => [
                            ['name' => 'nom', 'label' => 'Nom', 'type' => 'text', 'required' => true],
                            ['name' => 'email', 'label' => 'Email', 'type' => 'text'],
                        ]],

                        ['name' => 'clauses', 'label' => 'Clauses spécifiques', 'type' => 'textarea'],

                        ['name' => 'langue', 'label' => 'Langue', 'type' => 'select', 'options' => ['FR', 'EN'], 'required' => true],


                        ['name' => 'attachments', 'label' => 'Pièces', 'type' => 'files', 'accept' => ['.pdf', '.jpg', '.png'], 'max_files' => 5],
                    ],
                ],
            ],
        ];

        $rt->save();
    }
}
