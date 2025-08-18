<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            if (Schema::hasColumn('formations', 'type')) {
                $table->string('type')->nullable()->change();
            } else {
                $table->string('type')->nullable();
            }
            if (!Schema::hasColumn('formations', 'level')) {
                $table->string('level')->nullable();
            }
            if (!Schema::hasColumn('formations', 'modules')) {
                $table->json('modules')->nullable();
            }
            if (!Schema::hasColumn('formations', 'price_type')) {
                $table->string('price_type')->nullable();
            }
            if (!Schema::hasColumn('formations', 'price_cfa')) {
                $table->unsignedBigInteger('price_cfa')->nullable();
            }
            if (!Schema::hasColumn('formations', 'max_participants')) {
                $table->unsignedInteger('max_participants')->nullable();
            }
            if (!Schema::hasColumn('formations', 'duration')) {
                $table->string('duration')->nullable();
            }
            if (!Schema::hasColumn('formations', 'trainer')) {
                $table->string('trainer')->nullable();
            }
            if (!Schema::hasColumn('formations', 'date')) {
                $table->date('date')->nullable();
            }
            if (!Schema::hasColumn('formations', 'active')) {
                $table->boolean('active')->default(true)->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('formations', function (Blueprint $table) {});
    }
};
