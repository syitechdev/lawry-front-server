<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            if (!Schema::hasColumn('formations', 'payment_status')) {
                $table->string('payment_status', 20)->default('unpaid')->index();
            }
            if (!Schema::hasColumn('formations', 'paid_at')) {
                $table->timestamp('paid_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            if (Schema::hasColumn('formations', 'paid_at')) {
                $table->dropColumn('paid_at');
            }
            if (Schema::hasColumn('formations', 'payment_status')) {
                $table->dropColumn('payment_status');
            }
        });
    }
};
