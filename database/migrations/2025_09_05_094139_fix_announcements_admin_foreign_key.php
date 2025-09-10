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
        Schema::table('announcements', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['admin_id']);
            
            // Add the correct foreign key constraint pointing to users table
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['admin_id']);
            
            // Add back the original constraint (if needed)
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};