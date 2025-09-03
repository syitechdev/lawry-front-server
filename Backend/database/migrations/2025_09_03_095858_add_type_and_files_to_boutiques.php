<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            if (!Schema::hasColumn('boutiques', 'type')) {
                if (Schema::getConnection()->getDriverName() === 'mysql') {
                    $table->enum('type', ['service', 'file'])->default('service')->after('code');
                } else {
                    $table->string('type')->default('service')->after('code');
                }
            }
            if (!Schema::hasColumn('boutiques', 'files')) {
                $table->json('files')->nullable()->after('image_path');
            }
            if (!Schema::hasColumn('boutiques', 'downloads_count')) {
                $table->unsignedInteger('downloads_count')->default(0)->after('files');
            }
        });
    }

    public function down(): void
    {
        Schema::table('boutiques', function (Blueprint $table) {
            if (Schema::hasColumn('boutiques', 'type')) $table->dropColumn('type');
            if (Schema::hasColumn('boutiques', 'files')) $table->dropColumn('files');
            if (Schema::hasColumn('boutiques', 'downloads_count')) $table->dropColumn('downloads_count');
        });
    }
};
