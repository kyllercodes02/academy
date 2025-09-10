<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class AlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public array $payload;

    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    public function via($notifiable): array
    {
        return ['database', 'broadcast', 'mail'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => $this->payload['title'] ?? 'Alert',
            'message' => $this->payload['message'] ?? '',
            'url' => $this->payload['url'] ?? null,
            'level' => $this->payload['level'] ?? 'info',
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toMail($notifiable): MailMessage
    {
        $title = $this->payload['title'] ?? 'Alert Notification';
        $message = $this->payload['message'] ?? '';
        $url = $this->payload['url'] ?? null;

        $mail = (new MailMessage)
            ->subject($title)
            ->line($message);

        if ($url) {
            $mail->action('View Details', url($url));
        }

        return $mail;
    }
}


