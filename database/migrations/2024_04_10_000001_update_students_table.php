<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign('students_student_section_foreign');
        });

        Schema::table('students', function (Blueprint $table) {
            // Now we can safely drop the columns
            $table->dropColumn(['student_section', 'grade_level']);

            // Add new foreign key columns
            $table->foreignId('section_id')->nullable()->constrained('sections');
            $table->foreignId('grade_level_id')->nullable()->constrained('grade_levels');
        });

        // Migrate existing data
        $sections = DB::table('sections')->get();
        $gradeLevels = DB::table('grade_levels')->get();
        
        $students = DB::table('students')->get();
        foreach ($students as $student) {
            $section = $sections->firstWhere('name', $student->student_section);
            $gradeLevel = $gradeLevels->firstWhere('name', $student->grade_level);
            
            if ($section) {
                DB::table('students')
                    ->where('id', $student->id)
                    ->update([
                        'section_id' => $section->id,
                        'grade_level_id' => $gradeLevel ? $gradeLevel->id : null
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Get the data before dropping columns
        $students = DB::table('students')
            ->join('sections', 'students.section_id', '=', 'sections.id')
            ->leftJoin('grade_levels', 'students.grade_level_id', '=', 'grade_levels.id')
            ->select('students.id', 'sections.name as section_name', 'grade_levels.name as grade_level_name')
            ->get();

        Schema::table('students', function (Blueprint $table) {
            // Drop the foreign key constraints
            $table->dropForeign(['section_id']);
            $table->dropForeign(['grade_level_id']);
            $table->dropColumn(['section_id', 'grade_level_id']);

            // Add back the old columns
            $table->string('student_section')->nullable();
            $table->string('grade_level')->nullable();
        });

        // Restore the data
        foreach ($students as $student) {
            DB::table('students')
                ->where('id', $student->id)
                ->update([
                    'student_section' => $student->section_name,
                    'grade_level' => $student->grade_level_name
                ]);
        }

        // Re-add the foreign key constraint
        Schema::table('students', function (Blueprint $table) {
            $table->foreign('student_section')->references('name')->on('sections');
        });
    }
}; 