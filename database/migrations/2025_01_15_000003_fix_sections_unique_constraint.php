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
        // Drop the existing unique constraint
        Schema::table('sections', function (Blueprint $table) {
            $table->dropUnique(['name', 'academic_year']);
        });

        // Add a new unique constraint that includes grade_level_id
        Schema::table('sections', function (Blueprint $table) {
            $table->unique(['name', 'grade_level_id', 'academic_year'], 'sections_name_grade_academic_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new unique constraint
        Schema::table('sections', function (Blueprint $table) {
            $table->dropUnique('sections_name_grade_academic_unique');
        });

        // Restore the original unique constraint
        Schema::table('sections', function (Blueprint $table) {
            $table->unique(['name', 'academic_year']);
        });
    }
};
