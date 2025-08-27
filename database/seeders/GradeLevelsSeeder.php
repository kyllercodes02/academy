<?php

namespace Database\Seeders;

use App\Models\GradeLevel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GradeLevelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gradeLevels = [
            [
                'name' => 'Grade 7',
                'description' => 'First year of Junior High School',
            ],
            [
                'name' => 'Grade 8',
                'description' => 'Second year of Junior High School',
            ],
            [
                'name' => 'Grade 9',
                'description' => 'Third year of Junior High School',
            ],
            [
                'name' => 'Grade 10',
                'description' => 'Fourth year of Junior High School',
            ],
            [
                'name' => 'Grade 11',
                'description' => 'First year of Senior High School',
            ],
            [
                'name' => 'Grade 12',
                'description' => 'Second year of Senior High School',
            ],
        ];

        foreach ($gradeLevels as $gradeLevel) {
            GradeLevel::updateOrCreate(
                ['name' => $gradeLevel['name']],
                [
                    'description' => $gradeLevel['description'],
                    'status' => 'active'
                ]
            );
        }
    }
}
