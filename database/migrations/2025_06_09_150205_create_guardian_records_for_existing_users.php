<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Guardian;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $guardianUsers = User::where('role', 'guardian')->get();

        foreach ($guardianUsers as $user) {
            // Check if a guardian record already exists
            if (!Guardian::where('user_id', $user->id)->exists()) {
                // Get the guardian details
                $guardianDetails = $user->guardianDetails;

                if ($guardianDetails) {
                    Guardian::create([
                        'user_id' => $user->id,
                        'relationship' => $guardianDetails->relationship,
                        'contact_number' => $guardianDetails->contact_number,
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Guardian::whereIn('user_id', User::where('role', 'guardian')->pluck('id'))->delete();
    }
};
