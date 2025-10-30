<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class DatabaseConnectionService
{
    /**
     * Execute a database operation with automatic reconnection on failure
     */
    public static function executeWithRetry(callable $callback, int $maxRetries = 3)
    {
        $attempt = 0;
        
        while ($attempt < $maxRetries) {
            try {
                return $callback();
            } catch (Exception $e) {
                $attempt++;
                
                // Check if it's a MySQL connection error
                if (str_contains($e->getMessage(), 'MySQL server has gone away') || 
                    str_contains($e->getMessage(), 'Lost connection to MySQL server')) {
                    
                    Log::warning("Database connection lost, attempting reconnection (attempt {$attempt}/{$maxRetries})", [
                        'error' => $e->getMessage(),
                        'attempt' => $attempt,
                    ]);
                    
                    // Reconnect to database
                    DB::reconnect();
                    
                    if ($attempt < $maxRetries) {
                        // Wait a bit before retrying
                        usleep(500000); // 0.5 seconds
                        continue;
                    }
                }
                
                // If it's not a connection error or we've exhausted retries, throw the exception
                throw $e;
            }
        }
        
        throw new Exception("Failed to execute database operation after {$maxRetries} attempts");
    }
    
    /**
     * Check database connection health
     */
    public static function checkConnection(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (Exception $e) {
            Log::error('Database connection check failed', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
    
    /**
     * Reconnect to database
     */
    public static function reconnect(): void
    {
        try {
            DB::reconnect();
            Log::info('Database reconnected successfully');
        } catch (Exception $e) {
            Log::error('Failed to reconnect to database', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
