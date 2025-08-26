<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('enterprise_type_offers', function (Blueprint $table) {
            if (!Schema::hasColumn('enterprise_type_offers', 'subtitle')) $table->string('subtitle')->nullable()->after('title');
            if (!Schema::hasColumn('enterprise_type_offers', 'is_active')) $table->boolean('is_active')->default(true)->after('subtitle');
            if (!Schema::hasColumn('enterprise_type_offers', 'pricing_mode')) $table->string('pricing_mode', 10)->default('from')->after('is_active')->index();
            if (!Schema::hasColumn('enterprise_type_offers', 'price_amount_abidjan')) $table->unsignedInteger('price_amount_abidjan')->nullable()->after('pricing_mode');
            if (!Schema::hasColumn('enterprise_type_offers', 'price_amount_interior')) $table->unsignedInteger('price_amount_interior')->nullable()->after('price_amount_abidjan');
            if (!Schema::hasColumn('enterprise_type_offers', 'currency')) $table->string('currency', 10)->default('XOF')->after('price_amount_interior');
            if (!Schema::hasColumn('enterprise_type_offers', 'delivery_min_days')) $table->unsignedSmallInteger('delivery_min_days')->nullable()->after('currency');
            if (!Schema::hasColumn('enterprise_type_offers', 'delivery_max_days')) $table->unsignedSmallInteger('delivery_max_days')->nullable()->after('delivery_min_days');
            if (!Schema::hasColumn('enterprise_type_offers', 'pill')) $table->string('pill', 40)->nullable()->after('delivery_max_days');
            if (!Schema::hasColumn('enterprise_type_offers', 'cta')) $table->string('cta', 80)->nullable()->after('pill');
            if (!Schema::hasColumn('enterprise_type_offers', 'sort_index')) $table->unsignedInteger('sort_index')->default(0)->after('cta')->index();
            if (!Schema::hasColumn('enterprise_type_offers', 'features_json')) $table->json('features_json')->nullable()->after('sort_index');
            if (!Schema::hasColumn('enterprise_type_offers', 'meta')) $table->json('meta')->nullable()->after('features_json');
        });
    }

    public function down(): void
    {
        Schema::table('enterprise_type_offers', function (Blueprint $table) {
            foreach (
                [
                    'subtitle',
                    'is_active',
                    'pricing_mode',
                    'price_amount_abidjan',
                    'price_amount_interior',
                    'currency',
                    'delivery_min_days',
                    'delivery_max_days',
                    'pill',
                    'cta',
                    'sort_index',
                    'features_json',
                    'meta',
                ] as $col
            ) {
                if (Schema::hasColumn('enterprise_type_offers', $col)) $table->dropColumn($col);
            }
        });
    }
};
