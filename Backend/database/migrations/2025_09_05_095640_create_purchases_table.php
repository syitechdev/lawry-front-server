<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $t) {
            $t->id();
            $t->string('ref')->unique();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('boutique_id')->constrained('boutiques')->cascadeOnDelete();
            $t->enum('status', ['pending', 'paid', 'failed', 'cancelled', 'expired'])->index();
            $t->unsignedBigInteger('unit_price_cfa');
            $t->string('currency', 8)->default('XOF');
            $t->string('channel')->nullable();
            $t->json('customer_snapshot')->nullable();
            $t->json('product_snapshot')->nullable();
            $t->timestamp('delivered_at')->nullable();
            $t->json('delivered_payload')->nullable();
            $t->json('meta')->nullable();
            $t->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
