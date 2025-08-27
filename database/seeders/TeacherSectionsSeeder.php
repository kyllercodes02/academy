<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\TeacherSection;

class TeacherSectionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create a test teacher if it doesn't exist
        $teacher = User::firstOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'Test Teacher',
                'password' => bcrypt('password'),
                'role' => 'teacher'
            ]
        );

        // Get current academic year
        $academicYear = date('Y') . '-' . (date('Y') + 1);

        // Assign sections to the teacher
        $sections = [
            ['section' => 'Section A', 'grade_level' => '10'],
            ['section' => 'Section B', 'grade_level' => '11']
        ];

        foreach ($sections as $section) {
            TeacherSection::updateOrCreate(
                [
                    'teacher_id' => $teacher->id,
                    'section' => $section['section'],
                    'grade_level' => $section['grade_level'],
                    'academic_year' => $academicYear
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }
} 