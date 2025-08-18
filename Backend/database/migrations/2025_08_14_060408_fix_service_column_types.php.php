<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->unsignedInteger('price_cfa')->default(0)->change();
            $table->boolean('is_active')->default(false)->change();
            $table->unsignedInteger('orders_count')->default(0)->change();
            $table->decimal('rating', 3, 1)->nullable()->change();
            $table->json('documents')->nullable()->change();
            $table->string('duration_days', 100)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('price_cfa')->change();
            $table->string('is_active')->change();
            $table->string('orders_count')->change();
            $table->string('rating')->nullable()->change();
            $table->text('documents')->nullable()->change();
            $table->string('duration_days')->nullable()->change();
        });
    }
};
