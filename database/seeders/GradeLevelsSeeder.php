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
                'name' => 'Grade 1',
                'description' => 'First year of Elementary School',
                'level' => 1,
            ],
            [
                'name' => 'Grade 2',
                'description' => 'Second year of Elementary School',
                'level' => 2,
            ],
            [
                'name' => 'Grade 3',
                'description' => 'Third year of Elementary School',
                'level' => 3,
            ],
            [
                'name' => 'Grade 4',
                'description' => 'Fourth year of Elementary School',
                'level' => 4,
            ],
            [
                'name' => 'Grade 5',
                'description' => 'Fifth year of Elementary School',
                'level' => 5,
            ],
            [
                'name' => 'Grade 6',
                'description' => 'Sixth year of Elementary School',
                'level' => 6,
            ],
            [
                'name' => 'Grade 7',
                'description' => 'First year of Junior High School',
                'level' => 7,
            ],
            [
                'name' => 'Grade 8',
                'description' => 'Second year of Junior High School',
                'level' => 8,
            ],
            [
                'name' => 'Grade 9',
                'description' => 'Third year of Junior High School',
                'level' => 9,
            ],
            [
                'name' => 'Grade 10',
                'description' => 'Fourth year of Junior High School',
                'level' => 10,
            ],
            [
                'name' => 'Grade 11',
                'description' => 'First year of Senior High School',
                'level' => 11,
            ],
            [
                'name' => 'Grade 12',
                'description' => 'Second year of Senior High School',
                'level' => 12,
            ],
        ];

        foreach ($gradeLevels as $gradeLevel) {
            GradeLevel::updateOrCreate(
                ['name' => $gradeLevel['name']],
                [
                    'level' => $gradeLevel['level'],
                ]
            );
        }
    }
}
