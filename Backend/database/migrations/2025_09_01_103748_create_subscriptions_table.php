<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();

            $table->string('period', 20)->default('monthly');

            $table->string('status', 30)->default('pending_payment');

            $table->dateTime('current_cycle_start')->nullable();
            $table->dateTime('current_cycle_end')->nullable();

            $table->string('last_payment_reference')->nullable();
            $table->json('meta')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['plan_id', 'period']);
            $table->index(['current_cycle_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
