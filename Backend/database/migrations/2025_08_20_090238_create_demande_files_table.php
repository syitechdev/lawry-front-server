<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('demande_files', function (Blueprint $t) {
            $t->id();
            $t->foreignId('demande_id')->constrained('demandes')->cascadeOnDelete();
            $t->string('tag')->nullable();
            $t->string('original_name');
            $t->string('path');
            $t->string('mime', 120)->nullable();
            $t->unsignedBigInteger('size')->nullable();
            $t->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('demande_files');
    }
};
