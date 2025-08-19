<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->enum('experience', ['debutant', 'intermediaire', 'avance'])->nullable()->after('price_type');
            $table->enum('session_format', ['presentiel', 'distanciel'])->nullable()->after('experience');
            $table->timestamp('read_at')->nullable()->after('session_format');
        });
    }

    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropColumn(['experience', 'session_format', 'read_at']);
        });
    }
};
