<?php

namespace App\Listeners;

use App\Events\AttendanceUpdated;
use App\Models\Student;
use App\Services\SmsService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendAttendanceSmsNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public $queue = 'notifications';

    public function __construct(private SmsService $smsService)
    {
    }

    public function handle(AttendanceUpdated $event): void
    {
        $student = Student::find($event->studentId);
        if (!$student) {
            return;
        }

        $action = $event->checkOutTime ? 'checked out' : 'checked in';
        $timeString = $event->checkOutTime ? $event->checkOutTime : $event->checkInTime;
        $formatted = $timeString ? Carbon::parse($timeString)->format('g:i A') : Carbon::now()->format('g:i A');

        $message = sprintf('%s has %s at %s.', $student->name, $action, $formatted);
        $sentAny = false;

        // Collect numbers from user->guardianDetails
        $guardianUsers = $student->guardians()->with('guardianDetails')->get();
        foreach ($guardianUsers as $guardianUser) {
            $phone = optional($guardianUser->guardianDetails)->contact_number;
            if ($phone) {
                $ok = $this->smsService->send($phone, $message);
                $sentAny = $sentAny || $ok;
            }
        }

        // Fallback: Student belongsTo Guardian (if populated) with contact_number
        if (!$sentAny && method_exists($student, 'guardian') && $student->guardian) {
            $fallbackPhone = $student->guardian->contact_number ?? null;
            if ($fallbackPhone) {
                $ok = $this->smsService->send($fallbackPhone, $message);
                $sentAny = $sentAny || $ok;
            }
        }

        if (!$sentAny) {
            Log::warning('[SendAttendanceSmsNotification] No guardian phone numbers found for student', [
                'student_id' => $student->id,
                'student_name' => $student->name,
            ]);
        }
    }
}


