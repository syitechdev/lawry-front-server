<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('registration_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained('registrations')->cascadeOnDelete();
            $table->foreignId('formation_id')->constrained('formations')->cascadeOnDelete();
            $table->unsignedBigInteger('price_cfa')->nullable();
            $table->timestamps();
            $table->unique(['registration_id', 'formation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_items');
    }
};
