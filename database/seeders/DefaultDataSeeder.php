<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GradeLevel;
use App\Models\Section;

class DefaultDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create grade levels
        $gradeLevels = [
            ['name' => 'Grade 1', 'level' => 1],
            ['name' => 'Grade 2', 'level' => 2],
            ['name' => 'Grade 3', 'level' => 3],
            ['name' => 'Grade 4', 'level' => 4],
            ['name' => 'Grade 5', 'level' => 5],
            ['name' => 'Grade 6', 'level' => 6],
        ];

        foreach ($gradeLevels as $gradeLevel) {
            GradeLevel::firstOrCreate(
                ['level' => $gradeLevel['level']],
                $gradeLevel
            );
        }

        // Create sections for each grade level
        $sections = ['A', 'B', 'C'];
        foreach (GradeLevel::all() as $gradeLevel) {
            foreach ($sections as $section) {
                Section::firstOrCreate(
                    [
                        'name' => "Grade {$gradeLevel->level}-{$section}",
                        'grade_level_id' => $gradeLevel->id
                    ],
                    [
                        'academic_year' => date('Y'),
                    ]
                );
            }
        }
    }
} 