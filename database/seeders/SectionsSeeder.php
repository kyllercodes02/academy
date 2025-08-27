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
        
        $sections = [
            ['name' => 'Section A', 'grade_level' => '10'],
            ['name' => 'Section B', 'grade_level' => '10'],
            ['name' => 'Section C', 'grade_level' => '11'],
            ['name' => 'Section D', 'grade_level' => '11'],
        ];

        foreach ($sections as $section) {
            Section::updateOrCreate(
                [
                    'name' => $section['name'],
                    'academic_year' => $currentYear,
                ],
                [
                    'grade_level' => $section['grade_level'],
                ]
            );
        }
    }
} 