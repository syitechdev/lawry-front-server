<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'phone')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('phone');
            });
        }

        if (Schema::hasColumn('users', 'address')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('address');
            });
        }
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('email');
            $table->string('address', 255)->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'address') || Schema::hasColumn('users', 'phone')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'address')) {
                    $table->dropColumn('address');
                }
                if (Schema::hasColumn('users', 'phone')) {
                    $table->dropColumn('phone');
                }
            });
        }
    }
};
