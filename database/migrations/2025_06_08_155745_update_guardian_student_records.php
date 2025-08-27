<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update existing records to set default values
        DB::table('guardian_student')
            ->whereNull('is_primary_guardian')
            ->update(['is_primary_guardian' => false]);

        DB::table('guardian_student')
            ->whereNull('can_pickup')
            ->update(['can_pickup' => false]);

        // For each student, set the first guardian as primary if none is set
        $students = DB::table('guardian_student')
            ->select('student_id')
            ->groupBy('student_id')
            ->get();

        foreach ($students as $student) {
            $hasAnyPrimary = DB::table('guardian_student')
                ->where('student_id', $student->student_id)
                ->where('is_primary_guardian', true)
                ->exists();

            if (!$hasAnyPrimary) {
                DB::table('guardian_student')
                    ->where('student_id', $student->student_id)
                    ->orderBy('created_at')
                    ->limit(1)
                    ->update(['is_primary_guardian' => true]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need for down migration as we're just setting default values
    }
};
