<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;

class TestStudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'name' => 'John Doe',
                'guardian_email' => 'parent@example.com',
                'student_section' => 'Section A',
                'grade_level' => '10',
                'status' => 'active',
                'card_id' => 'test123'
            ],
            [
                'name' => 'Jane Smith',
                'guardian_email' => 'parent2@example.com',
                'student_section' => 'Section B',
                'grade_level' => '11',
                'status' => 'active',
                'card_id' => 'test456'
            ]
        ];

        foreach ($students as $student) {
            Student::updateOrCreate(
                ['card_id' => $student['card_id']],
                $student
            );
        }
    }
}
