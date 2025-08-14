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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();

            $table->foreignId('category_id')->constrained()->cascadeOnDelete();

            $table->string('status')->default('draft');
            $table->text('excerpt')->nullable();
            $table->longText('content');

            $table->string('image_url')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->index(['status', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
