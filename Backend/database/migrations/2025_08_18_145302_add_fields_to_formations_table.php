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
        Schema::table('formations', function (Blueprint $table) {
            $table->json('modules')->nullable()->after('description');
            $table->string('level')->nullable()->after('title');
            $table->string('price_type', 20)->default('fixed')->after('price_cfa');
            $table->unsignedBigInteger('price_cfa')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            //
        });
    }
};
