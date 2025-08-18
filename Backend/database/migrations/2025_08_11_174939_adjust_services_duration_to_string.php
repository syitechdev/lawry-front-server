<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            // Supprime les anciens champs si présents
            if (Schema::hasColumn('services', 'duration_min_days')) {
                $table->dropColumn('duration_min_days');
            }
            if (Schema::hasColumn('services', 'duration_max_days')) {
                $table->dropColumn('duration_max_days');
            }
            if (Schema::hasColumn('services', 'duration_days')) {
                $table->dropColumn('duration_days');
            }

            if (! Schema::hasColumn('services', 'duration_days')) {
                $table->string('duration_days', 50)->nullable()->after('price_cfa');
            } else {

                $table->string('duration_days', 50)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {

            $table->dropColumn('duration_days');
        });
    }
};
