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
        Schema::table('students', function (Blueprint $table) {
            // Drop old columns if they exist
            if (Schema::hasColumn('students', 'student_section')) {
                $table->dropColumn('student_section');
            }
            if (Schema::hasColumn('students', 'grade_level')) {
                $table->dropColumn('grade_level');
            }
            if (Schema::hasColumn('students', 'guardian_email')) {
                $table->dropColumn('guardian_email');
            }

            // Ensure required columns exist
            if (!Schema::hasColumn('students', 'status')) {
                $table->enum('status', ['active', 'inactive'])->default('active');
            }
            
            if (!Schema::hasColumn('students', 'card_id')) {
                $table->string('card_id')->nullable()->unique();
            }
            
            if (!Schema::hasColumn('students', 'photo_url')) {
                $table->string('photo_url')->nullable();
            }

            // Ensure foreign key constraints
            if (!Schema::hasColumn('students', 'section_id')) {
                $table->foreignId('section_id')->constrained()->onDelete('cascade');
            }
            
            if (!Schema::hasColumn('students', 'grade_level_id')) {
                $table->foreignId('grade_level_id')->constrained()->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            if (!Schema::hasColumn('students', 'student_section')) {
                $table->string('student_section')->nullable();
            }
            if (!Schema::hasColumn('students', 'grade_level')) {
                $table->string('grade_level')->nullable();
            }
            if (!Schema::hasColumn('students', 'guardian_email')) {
                $table->string('guardian_email')->nullable();
            }
        });
    }
}; 