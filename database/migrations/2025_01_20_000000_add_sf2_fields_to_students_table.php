<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Add LRN (Learner Reference Number) - 12 digits
            if (!Schema::hasColumn('students', 'lrn')) {
                $table->string('lrn', 12)->nullable()->after('name');
            }
            
            // Add date of birth
            if (!Schema::hasColumn('students', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('lrn');
            }
            
            // Add gender if not exists
            if (!Schema::hasColumn('students', 'gender')) {
                $table->enum('gender', ['male', 'female'])->nullable()->after('date_of_birth');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['lrn', 'date_of_birth', 'gender']);
        });
    }
};
