<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class VerifyUserCredentials extends Command
{
    protected $signature = 'users:verify-credentials {email?}';
    protected $description = 'Verify user credentials and fix any issues';

    public function handle()
    {
        $email = $this->argument('email');
        
        if ($email) {
            $users = User::where('email', $email)->get();
        } else {
            $users = User::all();
        }

        foreach ($users as $user) {
            $this->info("Checking user: {$user->email} (Role: {$user->role})");
            
            if (!$user->password) {
                $this->warn("- No password set");
                if ($this->confirm("Would you like to set a password for this user?")) {
                    $password = $this->secret("Enter new password:");
                    $user->password = $password;
                    $user->save();
                    $this->info("- Password has been set");
                }
            } else {
                $this->info("- Password is set and hashed");
            }

            if (!$user->role) {
                $this->warn("- No role set");
                if ($this->confirm("Would you like to set a role for this user?")) {
                    $role = $this->choice("Select role:", ['admin', 'teacher', 'guardian']);
                    $user->role = $role;
                    $user->save();
                    $this->info("- Role has been set to: {$role}");
                }
            } else {
                $this->info("- Role is set to: {$user->role}");
            }
        }

        $this->info("\nVerification complete!");
    }
} 