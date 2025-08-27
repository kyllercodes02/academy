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
        Schema::table('attendances', function (Blueprint $table) {
            // Drop existing columns if they exist
            if (Schema::hasColumn('attendances', 'time_in')) {
                $table->dropColumn('time_in');
            }
            if (Schema::hasColumn('attendances', 'time_out')) {
                $table->dropColumn('time_out');
            }

            // Add new columns if they don't exist
            if (!Schema::hasColumn('attendances', 'check_in_time')) {
                $table->time('check_in_time')->nullable()->after('status');
            }
            if (!Schema::hasColumn('attendances', 'remarks')) {
                $table->text('remarks')->nullable()->after('check_in_time');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Revert changes
            if (Schema::hasColumn('attendances', 'check_in_time')) {
                $table->dropColumn('check_in_time');
            }
            if (Schema::hasColumn('attendances', 'remarks')) {
                $table->dropColumn('remarks');
            }

            // Add back old columns
            $table->time('time_in')->nullable()->after('status');
            $table->time('time_out')->nullable()->after('time_in');
        });
    }
}; 