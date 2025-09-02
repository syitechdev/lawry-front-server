<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('conseil_gratuits', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone')->nullable();

            $table->string('legal_domain');
            $table->text('description');

            $table->enum('urgency', ['faible', 'moyen', 'eleve', 'critique'])->nullable();
            $table->boolean('consent')->default(false);

            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->foreignId('read_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('nouveau');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conseil_gratuits');
    }
};
