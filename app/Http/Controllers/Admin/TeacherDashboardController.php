<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use Carbon\Carbon;
use Inertia\Inertia;

class TeacherDashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // Get attendance statistics for today
        $stats = [
            'totalStudents' => Student::where('status', 'active')->count(),
            'presentToday' => Attendance::whereDate('date', $today)
                ->where('status', 'present')
                ->count(),
            'absentToday' => Attendance::whereDate('date', $today)
                ->where('status', 'absent')
                ->count(),
            'lateToday' => Attendance::whereDate('date', $today)
                ->where('status', 'late')
                ->count(),
        ];

        // Get recent attendance records
        $recentAttendance = Attendance::with('student')
            ->whereDate('date', $today)
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($attendance) {
                return [
                    'student_name' => $attendance->student->name,
                    'section' => $attendance->student->student_section,
                    'status' => $attendance->status,
                    'time' => Carbon::parse($attendance->time_in)->format('h:i A'),
                ];
            });

        return Inertia::render('Admin/TeacherDashboard', [
            'stats' => $stats,
            'recentAttendance' => $recentAttendance
        ]);
    }
} 