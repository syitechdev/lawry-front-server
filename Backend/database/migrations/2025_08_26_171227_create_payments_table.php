<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->morphs('payable');
            $table->string('reference', 64)->unique();

            $table->string('provider', 32)->default('paiementpro')->index();
            $table->string('session_id', 128)->nullable()->unique();

            $table->unsignedBigInteger('amount');
            $table->string('currency', 3)->default('XOF');
            $table->string('channel', 32)->nullable();

            $table->string('customer_name')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_phone', 32)->nullable();

            // Statut interne
            $table->enum('status', [
                'pending',
                'initiated',
                'processing',
                'succeeded',
                'failed',
                'cancelled',
                'expired',
            ])->default('pending')->index();

            $table->string('response_code', 32)->nullable();
            $table->string('response_message', 255)->nullable();

            $table->timestamp('initialized_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->unsignedSmallInteger('notification_count')->default(0);
            $table->timestamp('last_notified_at')->nullable();

            $table->json('meta')->nullable();

            $table->timestamps();
            $table->index(['status', 'created_at']);
            $table->index(['provider', 'channel']);
        });

        Schema::create('payment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('type', 50);
            $table->json('payload')->nullable();
            $table->string('remote_ip', 45)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_events');
        Schema::dropIfExists('payments');
    }
};
