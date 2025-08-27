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
        // Create grade_levels table
        Schema::create('grade_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('level');
            $table->timestamps();
        });

        // Add default grade levels
        for ($grade = 1; $grade <= 12; $grade++) {
            DB::table('grade_levels')->insert([
                'name' => "Grade {$grade}",
                'level' => $grade,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Add default sections to existing sections table
        $sections = ['A', 'B', 'C', 'D', 'E', 'F'];
        foreach ($sections as $section) {
            DB::table('sections')->insertOrIgnore([
                'name' => $section,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grade_levels');
        DB::table('sections')->whereIn('name', ['A', 'B', 'C', 'D', 'E', 'F'])->delete();
    }
}; 