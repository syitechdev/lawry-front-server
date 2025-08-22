<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $t) {
            $t->id();

            $t->string('ref', 32)->unique();

            $t->string('type_slug');
            $t->unsignedSmallInteger('type_version')->default(1);

            $t->string('status', 40)->default('recu')->index();
            $t->string('priority', 20)->default('normal')->index();      // normal|urgent
            $t->boolean('is_read')->default(false)->index();

            $t->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $t->string('paid_status', 20)->default('unpaid');
            $t->unsignedInteger('paid_amount')->nullable();
            $t->char('currency', 3)->default('XOF');

            $t->json('data');
            $t->json('meta')->nullable();

            $t->timestamp('submitted_at')->nullable()->index();
            $t->timestamps();

            $t->index(['type_slug', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
