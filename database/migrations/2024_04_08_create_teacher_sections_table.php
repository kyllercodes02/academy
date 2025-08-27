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
        Schema::create('teacher_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->string('section');
            $table->string('grade_level');
            $table->string('academic_year')->default(date('Y') . '-' . (date('Y') + 1));
            $table->timestamps();
            
            // Unique constraint with shorter name
            $table->unique(['teacher_id', 'section', 'grade_level', 'academic_year'], 'teacher_section_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_sections');
    }
}; 