<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetAdminCredentials extends Command
{
    protected $signature = 'admin:reset';
    protected $description = 'Reset admin credentials to default values';

    public function handle()
    {
        // Try to find existing admin user
        $admin = User::where('email', 'admin@gmail.com')->first();

        if (!$admin) {
            $admin = new User();
            $admin->email = 'admin@gmail.com';
            $this->info('Creating new admin user...');
        } else {
            $this->info('Updating existing admin user...');
        }

        // Set/update admin details
        $admin->name = 'Administrator';
        $admin->role = 'admin';
        $admin->password = Hash::make('password123');
        $admin->save();

        $this->info('Admin credentials have been reset to:');
        $this->info('Email: admin@gmail.com');
        $this->info('Password: password123');
        $this->info('Please change these credentials after logging in!');
    }
} 