<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Events\AttendanceUpdated;
use App\Models\Student;
use Carbon\Carbon;

class SimulateAttendanceEvent extends Command
{
    protected $signature = 'attendance:simulate {studentId} {--out : Simulate checkout instead of checkin}';

    protected $description = 'Dispatch AttendanceUpdated event for a given student to test real-time and SMS flows';

    public function handle(): int
    {
        $studentId = (int) $this->argument('studentId');
        $student = Student::find($studentId);
        if (!$student) {
            $this->error('Student not found.');
            return self::FAILURE;
        }

        $now = Carbon::now()->format('H:i:s');
        $checkIn = $this->option('out') ? null : $now;
        $checkOut = $this->option('out') ? $now : null;

        event(new AttendanceUpdated(
            $studentId,
            $checkOut ? 'present' : 'present',
            $checkIn,
            $checkOut,
            null
        ));

        $this->info('AttendanceUpdated event dispatched.');
        return self::SUCCESS;
    }
}


