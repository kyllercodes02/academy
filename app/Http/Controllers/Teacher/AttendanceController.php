<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $teacher = Auth::user();
        $teacherAssignment = $teacher->teacherAssignments()->with(['section', 'gradeLevel'])->first();

        if (!$teacherAssignment) {
            return Inertia::render('Teacher/Dashboard', [
                'message' => 'No section assigned yet.'
            ]);
        }

        $date = $request->input('date', now()->toDateString());
        $sectionId = $teacherAssignment->section_id;

        $query = Student::with(['section', 'gradeLevel', 'todayAttendance' => function ($query) use ($date) {
            $query->whereDate('date', $date);
        }])->where('section_id', $sectionId);

        // Add search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $students = $query->orderBy('name')->get()->map(function ($student) {
            $attendance = $student->todayAttendance;
            return [
                'id' => $student->id,
                'student_id' => $student->id, // Use student ID as student_id
                'first_name' => $student->name, // Use name as first_name
                'last_name' => '', // Empty last_name since we only have name
                'card_id' => $student->card_id,
                'section' => $student->section ? $student->section->name : null,
                'grade_level' => $student->gradeLevel ? $student->gradeLevel->name : null,
                'status' => $attendance ? $attendance->status : 'absent',
                'check_in' => $attendance ? Carbon::parse($attendance->check_in_time)->format('g:i A') : 'N/A',
            ];
        });

        return Inertia::render('Teacher/Attendance/Index', [
            'students' => [
                'data' => $students,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $students->count(),
                'total' => $students->count(),
            ],
            'sections' => [$teacherAssignment->section->name],
            'filters' => $request->only(['search', 'section']),
            'date' => $date,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late',
        ]);

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'date' => $request->date,
            ],
            [
                'status' => $request->status,
                'check_in_time' => $request->status === 'present' || $request->status === 'late' ? now()->format('H:i:s') : null,
            ]
        );

        return response()->json(['message' => 'Attendance recorded successfully', 'attendance' => $attendance]);
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late',
        ]);

        $teacher = Auth::user();
        $teacherAssignment = $teacher->teacherAssignments()->first();
        if (!$teacherAssignment) {
            return response()->json(['message' => 'No section assigned.'], 400);
        }
        $sectionId = $teacherAssignment->section_id;
        $students = Student::where('section_id', $sectionId)->get();
        foreach ($students as $student) {
            Attendance::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'date' => $request->date,
                ],
                [
                    'status' => $request->status,
                    'check_in_time' => $request->status === 'present' || $request->status === 'late' ? now()->format('H:i:s') : null,
                ]
            );
        }
        return response()->json(['message' => 'Bulk attendance updated successfully']);
    }

    public function export(Request $request)
    {
        $teacher = Auth::user();
        $teacherAssignment = $teacher->teacherAssignments()->with(['section', 'gradeLevel'])->first();
        if (!$teacherAssignment) {
            abort(403, 'No section assigned.');
        }
        $sectionId = $teacherAssignment->section_id;
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);
        $students = Student::with(['attendances' => function($q) use ($month, $year) {
            $q->whereMonth('date', $month)->whereYear('date', $year);
        }])->where('section_id', $sectionId)->get();
        $section = $teacherAssignment->section;
        $gradeLevel = $teacherAssignment->gradeLevel;
        // Generate PDF using a view or a PDF library (e.g., barryvdh/laravel-dompdf)
        $pdf = app('dompdf.wrapper');
        $pdf->loadView('pdf.sf2', [
            'students' => $students,
            'section' => $section,
            'gradeLevel' => $gradeLevel,
            'month' => $month,
            'year' => $year,
        ]);
        return $pdf->download('SF2_'.$section->name.'_'.$month.'_'.$year.'.pdf');
    }
}
