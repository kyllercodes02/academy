<?php

namespace App\Console\Commands;

use App\Models\Guardian;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateTestGuardian extends Command
{
    protected $signature = 'guardian:create-test';

    protected $description = 'Create a test guardian account';

    public function handle()
    {
        // Delete existing test guardian if exists
        Guardian::where('email', 'guardian@test.com')->delete();

        $password = 'password';
        $hashedPassword = Hash::make($password);

        $guardian = Guardian::create([
            'name' => 'Test Guardian',
            'email' => 'guardian@test.com',
            'password' => $hashedPassword,
            'phone' => '1234567890',
            'status' => 'active',
        ]);

        $this->info('Test guardian created successfully!');
        $this->info('Email: guardian@test.com');
        $this->info('Password: ' . $password);
        $this->info('Hashed Password: ' . $hashedPassword);

        // Verify the password hash
        if (Hash::check($password, $guardian->password)) {
            $this->info('Password hash verification successful!');
        } else {
            $this->error('Password hash verification failed!');
        }
    }
} 