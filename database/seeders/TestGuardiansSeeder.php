<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Guardian;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;

class TestGuardiansSeeder extends Seeder
{
    public function run(): void
    {
        $students = Student::all();
        
        if ($students->isEmpty()) {
            $this->command->info('No students found. Please run the TestStudentsSeeder first.');
            return;
        }

        // Create some test guardian accounts
        $guardians = [
            [
                'name' => 'John Parent',
                'email' => 'parent1@example.com',
                'password' => 'Password123!',
                'relationship' => 'parent',
                'contact_number' => '1234567890',
                'students' => [$students->first()->id]
            ],
            [
                'name' => 'Jane Guardian',
                'email' => 'guardian1@example.com',
                'password' => 'Password123!',
                'relationship' => 'guardian',
                'contact_number' => '0987654321',
                'students' => $students->count() > 1 ? [$students[1]->id] : [$students->first()->id]
            ],
        ];

        foreach ($guardians as $guardianData) {
            $user = User::create([
                'name' => $guardianData['name'],
                'email' => $guardianData['email'],
                'password' => Hash::make($guardianData['password']),
                'role' => 'guardian',
            ]);

            $guardian = Guardian::create([
                'user_id' => $user->id,
                'relationship' => $guardianData['relationship'],
                'contact_number' => $guardianData['contact_number'],
            ]);

            $guardian->students()->attach($guardianData['students']);
        }
    }
} 