<?php

namespace App\Listeners;

use App\Events\AlertTriggered;
use App\Notifications\AlertNotification;
use App\Events\AlertBroadcast;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Illuminate\Support\Facades\Log;

class SendAlertNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(AlertTriggered $event): void
    {
        try {
            $payload = $event->payload;

            // Find first admin user
            $admin = User::where('role', User::ROLE_ADMIN)->first();
            if (!$admin) {
                Log::warning('No admin user found to notify.');
                return;
            }

            // Send database, mail, and broadcast notifications via Notification system
            NotificationFacade::send($admin, new AlertNotification($payload));

            // Additionally broadcast on public admin.notifications channel for simple subscription
            event(new AlertBroadcast($payload));
        } catch (\Throwable $e) {
            Log::error('Failed to send alert notification: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
        }
    }
}


