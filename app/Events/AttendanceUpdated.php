<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $studentId;
    public $status;
    public $checkInTime;
    public $checkOutTime;
    public $remarks;

    /**
     * Create a new event instance.
     */
    public function __construct($studentId, $status, $checkInTime = null, $checkOutTime = null, $remarks = null)
    {
        $this->studentId = $studentId;
        $this->status = $status;
        $this->checkInTime = $checkInTime;
        $this->checkOutTime = $checkOutTime;
        $this->remarks = $remarks;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('attendance'),
        ];
    }
} 