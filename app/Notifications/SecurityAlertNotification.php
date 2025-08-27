<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class SecurityAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function via($notifiable)
    {
        // Send to database (for listing), broadcast (real-time), and mail (email notification)
        return ['database', 'broadcast', 'mail'];
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'security_alert',
            'student_id' => $this->data['student_id'],
            'name' => $this->data['name'],
            'grade_level' => $this->data['grade_level'],
            'student_section' => $this->data['student_section'],
            'time' => $this->data['time'],
            'message' => 'Possible fake student detected at the entrance.',
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Security Alert: Possible Fake Student')
            ->line('A possible fake student was detected at the entrance.')
            ->line('Student: ' . $this->data['name'])
            ->line('Grade Level: ' . $this->data['grade_level'])
            ->line('Section: ' . $this->data['student_section'])
            ->line('Time: ' . $this->data['time'])
            ->line('Please investigate immediately.');
    }
} 