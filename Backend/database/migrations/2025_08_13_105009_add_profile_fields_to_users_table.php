<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('code')->nullable()->unique()->after('id');
            $table->string('address')->nullable()->after('phone');
            $table->enum('status', ['Actif', 'Inactif', 'VIP'])
                ->default('Actif')->after('address');
            $table->unsignedInteger('services_count')->default(0)
                ->after('status');
            $table->timestamp('last_activity_at')->nullable()
                ->after('services_count');
        });

        $rows = DB::table('users')->select('id', 'code')->get();
        foreach ($rows as $u) {
            if ($u->code === null) {
                $code = 'CLI' . str_pad((string)$u->id, 3, '0', STR_PAD_LEFT);
                DB::table('users')->where('id', $u->id)->update(['code' => $code]);
            }
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('code')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['code', 'address', 'status', 'services_count', 'last_activity_at']);
        });
    }
};
