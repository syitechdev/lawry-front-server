<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Boutique;
use App\Models\Purchase;

class DemoPurchasesSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create([
                'name'  => 'Jean Test',
                'email' => 'codeinternet7@gamil.com',
                'phone' => '0700000000',
            ]);
        }

        $prod3 = Boutique::firstOrCreate(
            ['code' => 'PROD1005'],
            [
                'name' => 'Pack de Travail',
                'type' => 'file',
                'price_cfa' => 25000,
                'description' => 'Contrats CDD/CDI conformes',
                'files' => ['boutique/files/exemple1.pdf', 'boutique/files/exemple2.pdf'],
                'category_id' => 2
            ]
        );

        $prod4 = Boutique::firstOrCreate(
            ['code' => 'PROD104'],
            [
                'name' => 'Conseil Juridique 30 min',
                'type' => 'service',
                'price_cfa' => 15000,
                'description' => 'Appel téléphonique avec un avocat',
                'category_id' => 2,
                'files' => ['boutique/files/exemple1.pdf', 'boutique/files/exemple2.pdf'],
            ]
        );

        foreach ([$prod3, $prod4] as $i => $prod) {
            Purchase::create([
                'ref'            => 'PUR-DEMO-' . ($i + 1),
                'user_id'        => $user->id,
                'boutique_id'    => $prod->id,
                'status'         => 'paid',
                'unit_price_cfa' => $prod->price_cfa,
                'currency'       => 'XOF',
                'customer_snapshot' => [
                    'firstName' => 'Jean',
                    'lastName'  => 'Test',
                    'email'     => $user->email,
                    'phone'     => $user->phone,
                ],
                'product_snapshot' => [
                    'name'        => $prod->name,
                    'code'        => $prod->code,
                    'type'        => $prod->type,
                    'description' => $prod->description,
                    'files_urls'  => $prod->files_urls ?? [],
                    'image_url'   => $prod->image_url,
                ],
                'delivered_at' => now(),
                'delivered_payload' => ['mode' => $prod->type],
            ]);
        }
    }
}
