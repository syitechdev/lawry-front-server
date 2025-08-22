<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $t) {

            $t->string('variant_key', 60)->nullable()->after('type_slug')->index();
            $t->index(['type_slug', 'variant_key']);
        });
    }

    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $t) {
            $t->dropIndex(['type_slug', 'variant_key']);
            $t->dropColumn('variant_key');
        });
    }
};
