<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('demande_messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('demande_id')->constrained('demandes')->cascadeOnDelete();
            $t->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('sender_role', 16)->default('staff');
            $t->boolean('is_internal')->default(false);
            $t->text('body');
            $t->timestamp('read_at')->nullable();
            $t->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('demande_messages');
    }
};
