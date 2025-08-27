<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the guardian dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Load students with their attendance records
        $students = $user->students()
            ->with(['section', 'gradeLevel'])
            ->get()
            ->map(function ($student) {
                // Get today's attendance and recent attendance records
                $attendances = $student->attendances()
                    ->whereDate('date', '>=', Carbon::now()->subDays(30))
                    ->orderBy('date', 'desc')
                    ->get();

                $todayAttendance = $attendances->first(function ($attendance) {
                    return $attendance->date === Carbon::today()->toDateString();
                });

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'student_section' => $student->section->name,
                    'grade_level' => $student->gradeLevel->name,
                    'today_attendance' => $todayAttendance,
                    'recent_attendances' => $attendances->take(5)->values()
                ];
            });

        return Inertia::render('Guardian/Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ],
            'students' => $students
        ]);
    }

    /**
     * Get active announcements for the guardian.
     */
    private function getActiveAnnouncements()
    {
        return \App\Models\Announcement::active()
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }
} 