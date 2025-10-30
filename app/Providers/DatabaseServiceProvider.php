<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

class DatabaseServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Handle MySQL connection issues
        Event::listen(QueryExecuted::class, function (QueryExecuted $event) {
            if ($event->connectionName === 'mysql') {
                // Log slow queries
                if ($event->time > 1000) { // More than 1 second
                    Log::warning('Slow query detected', [
                        'sql' => $event->sql,
                        'time' => $event->time,
                        'connection' => $event->connectionName,
                    ]);
                }
            }
        });

        // Handle database connection errors
        DB::listen(function ($query) {
            if ($query->time > 5000) { // More than 5 seconds
                Log::error('Very slow query detected', [
                    'sql' => $query->sql,
                    'time' => $query->time,
                    'bindings' => $query->bindings,
                ]);
            }
        });
    }
}
