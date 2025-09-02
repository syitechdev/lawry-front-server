<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private function indexExists(string $table, string $index): bool
    {
        $db = DB::getDatabaseName();
        $row = DB::selectOne(
            "SELECT COUNT(1) AS c
             FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?
             LIMIT 1",
            [$db, $table, $index]
        );
        return (int)($row->c ?? 0) > 0;
    }

    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            if (!Schema::hasColumn('plans', 'slug')) {
                $table->string('slug', 191)->nullable()->after('id');
            }

            if (!Schema::hasColumn('plans', 'monthly_price_cfa')) {
                $table->unsignedInteger('monthly_price_cfa')->default(0)->after('code');
            }
            if (!Schema::hasColumn('plans', 'yearly_price_cfa')) {
                $table->unsignedInteger('yearly_price_cfa')->default(0)->after('monthly_price_cfa');
            }
            if (!Schema::hasColumn('plans', 'is_trial')) {
                $table->boolean('is_trial')->default(false)->after('yearly_price_cfa');
            }
            if (!Schema::hasColumn('plans', 'trial_days')) {
                $table->unsignedSmallInteger('trial_days')->nullable()->after('is_trial');
            }
            if (!Schema::hasColumn('plans', 'popular')) {
                $table->boolean('popular')->default(false)->after('trial_days');
            }
            if (!Schema::hasColumn('plans', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('popular');
            }
            if (!Schema::hasColumn('plans', 'features')) {
                $table->json('features')->nullable()->after('description');
            }
            if (!Schema::hasColumn('plans', 'gradient_from')) {
                $table->string('gradient_from')->default('from-blue-500')->after('features');
            }
            if (!Schema::hasColumn('plans', 'gradient_to')) {
                $table->string('gradient_to')->default('to-blue-600')->after('gradient_from');
            }
            if (!Schema::hasColumn('plans', 'sort_index')) {
                $table->unsignedInteger('sort_index')->default(0)->after('gradient_to');
            }
        });

        if (
            !$this->indexExists('plans', 'plans_active_popular_sort_idx')
            && !$this->indexExists('plans', 'plans_is_active_popular_sort_index_index')
        ) {
            Schema::table('plans', function (Blueprint $table) {
                $table->index(['is_active', 'popular', 'sort_index'], 'plans_active_popular_sort_idx');
            });
        }
    }

    public function down(): void
    {
        if ($this->indexExists('plans', 'plans_active_popular_sort_idx')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->dropIndex('plans_active_popular_sort_idx');
            });
        }
        if ($this->indexExists('plans', 'plans_is_active_popular_sort_index_index')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->dropIndex('plans_is_active_popular_sort_index_index');
            });
        }

        Schema::table('plans', function (Blueprint $table) {
            if (Schema::hasColumn('plans', 'sort_index'))    $table->dropColumn('sort_index');
            if (Schema::hasColumn('plans', 'gradient_to'))   $table->dropColumn('gradient_to');
            if (Schema::hasColumn('plans', 'gradient_from')) $table->dropColumn('gradient_from');
            if (Schema::hasColumn('plans', 'features'))      $table->dropColumn('features');
            if (Schema::hasColumn('plans', 'is_active'))     $table->dropColumn('is_active');
            if (Schema::hasColumn('plans', 'popular'))       $table->dropColumn('popular');
            if (Schema::hasColumn('plans', 'trial_days'))    $table->dropColumn('trial_days');
            if (Schema::hasColumn('plans', 'is_trial'))      $table->dropColumn('is_trial');
            if (Schema::hasColumn('plans', 'yearly_price_cfa'))  $table->dropColumn('yearly_price_cfa');
            if (Schema::hasColumn('plans', 'monthly_price_cfa')) $table->dropColumn('monthly_price_cfa');
            if (Schema::hasColumn('plans', 'slug'))          $table->dropColumn('slug');
        });
    }
};
