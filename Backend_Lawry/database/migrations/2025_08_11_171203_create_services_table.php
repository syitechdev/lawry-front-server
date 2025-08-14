<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->string('code')->unique();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->unsignedInteger('price_cfa')->default(0);
            $table->text('duration_days')->nullable();
            $table->unsignedInteger('orders_count')->default(0);
            $table->decimal('rating', 3, 1)->nullable();
            $table->json('documents')->nullable();
            $table->index(['is_active', 'price_cfa']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
