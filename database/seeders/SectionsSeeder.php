<?php

namespace Database\Seeders;

use App\Models\Section;
use Illuminate\Database\Seeder;

class SectionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currentYear = date('Y') . '-' . (date('Y') + 1);
        
        // Get all grade levels
        $gradeLevels = \App\Models\GradeLevel::all();
        
        $sections = [];
        
        // Create sections A-E for each grade level
        foreach ($gradeLevels as $gradeLevel) {
            for ($i = 0; $i < 5; $i++) {
                $sectionName = chr(65 + $i); // A, B, C, D, E
                $sections[] = [
                    'name' => "Section {$sectionName}",
                    'grade_level_id' => $gradeLevel->id,
                    'academic_year' => $currentYear,
                ];
            }
        }

        foreach ($sections as $section) {
            Section::updateOrCreate(
                [
                    'name' => $section['name'],
                    'grade_level_id' => $section['grade_level_id'],
                    'academic_year' => $currentYear,
                ],
                [
                    'academic_year' => $currentYear,
                ]
            );
        }
    }
} 