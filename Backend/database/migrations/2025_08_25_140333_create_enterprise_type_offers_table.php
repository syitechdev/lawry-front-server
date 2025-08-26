<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enterprise_type_offers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('enterprise_type_id')
                ->constrained('enterprise_types')
                ->cascadeOnDelete();

            $table->string('key', 64);
            $table->string('title', 180);
            $table->string('subtitle', 250)->nullable();

            // pricing
            $table->enum('pricing_mode', ['fixed', 'from', 'quote'])->default('quote');
            $table->unsignedInteger('price_amount_abidjan')->nullable();
            $table->unsignedInteger('price_amount_interieur')->nullable();
            $table->string('currency', 3)->default('XOF');

            $table->json('features')->nullable();
            $table->string('cta', 120)->nullable();

            // publication + tri
            $table->boolean('is_active')->default(true)->index('et_offers_active_idx');
            $table->unsignedSmallInteger('sort_index')->default(0);

            $table->json('meta')->nullable();

            $table->timestamps();

            // contraintes / index avec noms courts
            $table->unique(['enterprise_type_id', 'key'], 'et_offers_type_key_unique');
            $table->index(['enterprise_type_id', 'is_active', 'sort_index'], 'et_offers_etid_act_sort_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enterprise_type_offers');
    }
};
