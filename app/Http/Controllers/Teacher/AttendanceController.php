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

        $date = $request->get('date', now()->format('Y-m-d'));
        $sectionId = $teacherAssignment->section_id;
        
        // Query builder for students
        $query = Student::query()
            ->with(['attendances' => function($query) use ($date) {
                $query->whereDate('date', $date);
            }, 'section'])
            ->where('status', 'active')
            ->where('section_id', $sectionId);

        $students = $query->orderBy('name')->get();

        // Transform data for Inertia
        $studentsData = $students->map(function ($student) use ($date) {
            $attendance = $student->attendances->first();
            return [
                'id' => $student->id,
                'name' => $student->name,
                'section' => $student->section?->name,
                'attendance' => [
                    'status' => $attendance ? $attendance->status : 'absent',
                    'check_in_time' => $attendance ? $attendance->check_in_time : null,
                    'check_out_time' => $attendance ? $attendance->check_out_time : null,
                    'remarks' => $attendance ? $attendance->remarks : null,
                ],
            ];
        });

        return Inertia::render('Teacher/Attendance/Index', [
            'students' => $studentsData,
            'currentDate' => $date,
            'filters' => $request->all('search', 'date'),
        ]);
    }

    /**
     * Get attendance data for AJAX requests
     */
    public function getData(Request $request)
    {
        $teacher = Auth::user();
        $teacherAssignment = $teacher->teacherAssignments()->with(['section', 'gradeLevel'])->first();

        if (!$teacherAssignment) {
            return response()->json(['error' => 'No section assigned'], 400);
        }

        $date = $request->get('date', now()->format('Y-m-d'));
        $sectionId = $teacherAssignment->section_id;
        
        $query = Student::query()
            ->with(['attendances' => function($query) use ($date) {
                $query->whereDate('date', $date);
            }, 'section'])
            ->where('status', 'active')
            ->where('section_id', $sectionId);

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $students = $query->orderBy('name')->get();

        $studentsData = $students->map(function ($student) {
            $attendance = $student->attendances->first();
            return [
                'id' => $student->id,
                'name' => $student->name,
                'section' => $student->section?->name,
                'attendance' => [
                    'status' => $attendance ? $attendance->status : 'absent',
                    'check_in_time' => $attendance ? $attendance->check_in_time : null,
                    'check_out_time' => $attendance ? $attendance->check_out_time : null,
                    'remarks' => $attendance ? $attendance->remarks : null,
                ],
            ];
        });

        return response()->json([
            'students' => $studentsData,
            'currentDate' => $date,
            'filters' => $request->all('search', 'date'),
        ]);
    }

    /**
     * Store or update attendance records
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'students' => 'required|array',
            'students.*.id' => 'required|exists:students,id',
            'students.*.status' => 'required|in:present,absent,late',
            'students.*.remarks' => 'nullable|string',
        ]);

        $date = $request->date;
        $currentTime = Carbon::now();

        foreach ($request->students as $studentData) {
            $attendance = Attendance::updateOrCreate(
                [
                    'student_id' => $studentData['id'],
                    'date' => $date,
                ],
                [
                    'status' => $studentData['status'],
                    'remarks' => $studentData['remarks'] ?? null,
                    'check_in_time' => $studentData['status'] !== 'absent' ? $currentTime->format('H:i:s') : null,
                ]
            );

            event(new \App\Events\AttendanceUpdated(
                $studentData['id'],
                $attendance->status,
                $attendance->check_in_time,
                $attendance->check_out_time,
                $attendance->remarks
            ));
        }

        return back()->with('success', 'Attendance records updated successfully.');
    }

    /**
     * Update a single attendance record
     */
    public function update(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late',
            'remarks' => 'nullable|string',
            'check_out' => 'nullable|boolean',
        ]);

        $currentTime = Carbon::now();
        $updateData = [
            'status' => $request->status,
            'remarks' => $request->remarks,
        ];

        // Handle check-in
        if ($request->status !== 'absent' && !$request->check_out) {
            $updateData['check_in_time'] = $currentTime->format('H:i:s');
        }

        // Handle check-out
        if ($request->check_out) {
            $updateData['check_out_time'] = $currentTime->format('H:i:s');
        }

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'date' => $request->date,
            ],
            $updateData
        );

        // Broadcast and dispatch the attendance update
        $event = new \App\Events\AttendanceUpdated(
            $request->student_id,
            $attendance->status,
            $attendance->check_in_time,
            $attendance->check_out_time,
            $attendance->remarks
        );
        broadcast($event)->toOthers();
        event($event);

        return back()->with('success', 'Attendance record updated successfully.');
    }

    /**
     * Record student check-out
     */
    public function recordCheckOut(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'student_number' => 'required|string',
        ]);

        $student = Student::findOrFail($request->student_id);
        
        $attendance = Attendance::where('student_id', $request->student_id)
            ->whereDate('date', $request->date)
            ->first();

        if (!$attendance) {
            return back()->withErrors(['message' => 'No attendance record found for this student.']);
        }

        $attendance->check_out_time = now()->format('H:i:s');
        $attendance->save();

        // Broadcast and dispatch the attendance update
        $event = new \App\Events\AttendanceUpdated(
            $request->student_id,
            $attendance->status,
            $attendance->check_in_time,
            $attendance->check_out_time,
            $attendance->remarks
        );
        broadcast($event)->toOthers();
        event($event);

        return back()->with('success', 'Check-out recorded successfully.');
    }

    /**
     * Bulk update attendance records
     */
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
        $query = Student::query()->where('status', 'active')->where('section_id', $sectionId);
        $students = $query->get();
        $currentTime = Carbon::now();

        foreach ($students as $student) {
            $attendance = Attendance::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'date' => $request->date,
                ],
                [
                    'status' => $request->status,
                    'check_in_time' => $request->status !== 'absent' ? $currentTime->format('H:i:s') : null,
                ]
            );

            event(new \App\Events\AttendanceUpdated(
                $student->id,
                $attendance->status,
                $attendance->check_in_time,
                $attendance->check_out_time,
                $attendance->remarks
            ));
        }

        return back()->with('success', 'Attendance records updated successfully.');
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
