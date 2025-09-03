<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Student;
use Carbon\Carbon;

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
            new Channel('attendance.public'),
        ];
    }

    /**
     * The data to broadcast with the event.
     */
    public function broadcastWith(): array
    {
        $student = Student::find($this->studentId);
        $timeString = $this->checkOutTime ?: $this->checkInTime;
        $formatted = $timeString ? Carbon::parse($timeString)->format('g:i A') : Carbon::now()->format('g:i A');
        $action = $this->checkOutTime ? 'checked out' : 'checked in';

        return [
            'studentId' => $this->studentId,
            'status' => $this->status,
            'checkInTime' => $this->checkInTime,
            'checkOutTime' => $this->checkOutTime,
            'remarks' => $this->remarks,
            'studentName' => $student?->name,
            'message' => $student ? sprintf('%s has %s at %s.', $student->name, $action, $formatted) : null,
        ];
    }
} 