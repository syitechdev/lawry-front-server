<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('demande_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('demande_id')->constrained('demandes')->cascadeOnDelete();
            $t->string('event', 50);
            $t->json('payload')->nullable();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('actor_name')->nullable();
            $t->timestamps();
            $t->index(['demande_id', 'event']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('demande_events');
    }
};
