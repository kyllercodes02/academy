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
        // Drop the old name-only unique constraint
        Schema::table('sections', function (Blueprint $table) {
            $table->dropUnique('sections_name_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the name-only unique constraint
        Schema::table('sections', function (Blueprint $table) {
            $table->unique('name', 'sections_name_unique');
        });
    }
};
