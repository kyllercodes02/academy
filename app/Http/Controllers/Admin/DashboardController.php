<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // Get total students
        $totalStudents = Student::where('status', 'active')->count();

        // Get total present today
        $presentToday = Attendance::whereDate('created_at', $today)
            ->whereIn('status', ['present', 'late'])
            ->distinct('student_id')
            ->count();

        // Get total absent today
        $absentToday = $totalStudents - $presentToday;

        // Get attendance by section
        $attendanceBySection = DB::table('students')
            ->join('sections', 'students.section_id', '=', 'sections.id')
            ->leftJoin('attendances', function ($join) use ($today) {
                $join->on('students.id', '=', 'attendances.student_id')
                    ->whereDate('attendances.created_at', $today)
                    ->whereIn('attendances.status', ['present', 'late']);
            })
            ->where('students.status', 'active')
            ->groupBy('sections.id', 'sections.name')
            ->select(
                'sections.name as section_name',
                DB::raw('COUNT(DISTINCT students.id) as total_students'),
                DB::raw('COUNT(DISTINCT attendances.student_id) as present_students')
            )
            ->get()
            ->map(function ($section) {
                return [
                    'section' => $section->section_name,
                    'total' => $section->total_students,
                    'present' => $section->present_students,
                    'absent' => $section->total_students - $section->present_students,
                ];
            });

        // Get recent attendance records
        $recentAttendance = Attendance::with(['student.section', 'student.gradeLevel'])
            ->whereDate('created_at', $today)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'student_name' => $attendance->student->name,
                    'section' => $attendance->student->section->name,
                    'grade_level' => $attendance->student->gradeLevel->name,
                    'status' => $attendance->status,
                    'check_in_time' => $attendance->check_in_time,
                    'check_out_time' => $attendance->check_out_time,
                ];
            });

        // Get attendance trend for the last 7 days
        $attendanceTrend = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            $totalPresent = Attendance::whereDate('created_at', $date)
                ->whereIn('status', ['present', 'late'])
                ->distinct('student_id')
                ->count();

            return [
                'date' => $date->format('M d'),
                'present' => $totalPresent,
                'absent' => Student::where('status', 'active')->count() - $totalPresent,
            ];
        });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'presentToday' => $presentToday,
                'absentToday' => $absentToday,
                'attendanceRate' => $totalStudents > 0 ? round(($presentToday / $totalStudents) * 100) : 0,
            ],
            'attendanceBySection' => $attendanceBySection,
            'recentAttendance' => $recentAttendance,
            'attendanceTrend' => $attendanceTrend,
        ]);
    }
} 