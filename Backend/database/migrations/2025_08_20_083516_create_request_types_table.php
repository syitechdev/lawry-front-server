<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('request_types', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->unsignedSmallInteger('version')->default(1);
            $t->boolean('is_active')->default(true);

            $t->string('pricing_mode', 12)->default('quote');
            $t->unsignedInteger('price_amount')->nullable();
            $t->char('currency', 3)->default('XOF');

            $t->text('variants_csv')->nullable();
            $t->text('features_csv')->nullable();

            $t->json('config')->nullable();
            $t->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('request_types');
    }
};
