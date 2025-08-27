<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $today = Carbon::today();

        // Get total students and attendance stats
        $totalStudents = Student::count();
        $todayAttendance = Attendance::whereDate('date', $today)->get();
        $presentToday = $todayAttendance->where('status', 'present')->count();
        $tardyToday = $todayAttendance->where('status', 'late')->count();
        $absentToday = $totalStudents - ($presentToday + $tardyToday);
        $attendanceRate = $totalStudents > 0 ? round(($presentToday + $tardyToday) / $totalStudents * 100) : 0;

        // Get attendance by section
        $attendanceBySection = Section::with(['students.attendances' => function($query) use ($today) {
            $query->whereDate('date', $today);
        }])->get()->map(function($section) {
            $totalStudents = $section->students->count();
            $present = $section->students->filter(function($student) {
                return $student->attendances->where('status', 'present')->count() > 0;
            })->count();
            $absent = $totalStudents - $present;

            return [
                'section' => $section->name,
                'present' => $present,
                'absent' => $absent
            ];
        });

        // Get weekly attendance trend
        $attendanceTrend = collect(range(6, 0))->map(function($day) {
            $date = Carbon::today()->subDays($day);
            $attendances = Attendance::whereDate('date', $date)->get();
            
            return [
                'date' => $date->format('M d'),
                'present' => $attendances->where('status', 'present')->count(),
                'absent' => $attendances->where('status', 'late')->count()
            ];
        });

        // Get recent attendance records
        $recentAttendance = Attendance::with(['student.section', 'student.gradeLevel'])
            ->latest('date')
            ->take(10)
            ->get()
            ->map(function($attendance) {
                return [
                    'id' => $attendance->id,
                    'student_name' => $attendance->student->name,
                    'section' => $attendance->student->section->name,
                    'grade_level' => $attendance->student->gradeLevel->name,
                    'status' => $attendance->status,
                    'check_in' => $attendance->check_in_time,
                    'check_out' => $attendance->check_out_time,
                    'date' => $attendance->date
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ],
            'stats' => [
                'totalStudents' => $totalStudents,
                'presentToday' => $presentToday,
                'tardyToday' => $tardyToday,
                'absentToday' => $absentToday,
                'attendanceRate' => $attendanceRate
            ],
            'attendanceBySection' => $attendanceBySection,
            'attendanceTrend' => $attendanceTrend,
            'recentAttendance' => $recentAttendance
        ]);
    }
} 