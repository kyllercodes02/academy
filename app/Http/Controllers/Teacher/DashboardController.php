<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $teacher = Auth::user();
        $teacherAssignment = $teacher->teacherAssignments()->with(['section', 'gradeLevel'])->first();
        
        if (!$teacherAssignment) {
            return Inertia::render('Teacher/Dashboard', [
                'user' => [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'role' => $teacher->role
                ],
                'students' => [],
                'section' => null,
                'gradeLevel' => null,
                'message' => 'No section assigned yet.'
            ]);
        }

        $today = Carbon::today();
        
        $students = Student::query()
            ->where('section_id', $teacherAssignment->section_id)
            ->with(['attendances' => function($query) use ($today) {
                $query->whereDate('date', $today);
            }])
            ->get()
            ->map(function ($student) {
                $todayAttendance = $student->attendances->first();
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'card_id' => $student->card_id,
                    'attendance' => $todayAttendance ? [
                        'id' => $todayAttendance->id,
                        'status' => $todayAttendance->status,
                        'check_in_time' => $todayAttendance->check_in_time,
                        'check_out_time' => $todayAttendance->check_out_time,
                        'remarks' => $todayAttendance->remarks
                    ] : null
                ];
            });

        // Get attendance statistics
        $totalStudents = $students->count();
        $presentCount = $students->filter(fn($student) => 
            $student['attendance'] && $student['attendance']['status'] === 'present'
        )->count();
        $lateCount = $students->filter(fn($student) => 
            $student['attendance'] && $student['attendance']['status'] === 'late'
        )->count();
        $absentCount = $totalStudents - ($presentCount + $lateCount);

        return Inertia::render('Teacher/Dashboard', [
            'user' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'email' => $teacher->email,
                'role' => $teacher->role
            ],
            'students' => $students,
            'section' => $teacherAssignment->section,
            'gradeLevel' => $teacherAssignment->gradeLevel,
            'currentDate' => $today->format('Y-m-d'),
            'stats' => [
                'total' => $totalStudents,
                'present' => $presentCount,
                'late' => $lateCount,
                'absent' => $absentCount
            ]
        ]);
    }
} 