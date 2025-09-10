<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\Section;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AttendanceExport;

class AttendanceController extends Controller
{
    /**
     * Display the attendance management page
     */
    public function index(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $sections = Section::orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'name' => $section->name
                ];
            });
        $section = $request->get('section', $sections->first()?->id ?? null);
        
        // Query builder for students
        $query = Student::query()
            ->with(['attendances' => function($query) use ($date) {
                $query->whereDate('date', $date);
            }, 'section'])
            ->where('status', 'active');

        // Filter by section if specified
        if ($section) {
            $query->where('section_id', $section);
        }

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

        return Inertia::render('Admin/Attendance/Index', [
            'students' => $studentsData,
            'sections' => $sections,
            'currentSection' => $section,
            'currentDate' => $date,
            'filters' => $request->all('search', 'section', 'date'),
        ]);
    }

    /**
     * Get attendance data for DataTables
     */
    public function getData(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $section = $request->get('section');
        $gradeLevel = $request->get('grade_level');
        
        $query = Student::query()
            ->with(['attendances' => function($query) use ($date) {
                $query->whereDate('date', $date);
            }, 'section', 'gradeLevel'])
            ->where('status', 'active');

        if ($section && $section !== 'all') {
            $query->where('section_id', $section);
        }

        if ($gradeLevel && $gradeLevel !== 'all') {
            $query->where('grade_level_id', $gradeLevel);
        }

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
                'grade_level' => $student->gradeLevel?->name,
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
            'sections' => Section::orderBy('name')->get(['id', 'name']),
            'gradeLevels' => \App\Models\GradeLevel::orderBy('name')->get(['id', 'name']),
            'currentSection' => $section,
            'currentGradeLevel' => $gradeLevel,
            'currentDate' => $date,
            'filters' => $request->all('search', 'section', 'grade_level', 'date'),
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
            'section' => 'required|string',
            'status' => 'required|in:present,absent,late',
        ]);

        $query = Student::query()->where('status', 'active');

        if ($request->section !== 'all') {
            $query->where('section_id', $request->section);
        }

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

    /**
     * Export attendance records
     */
    public function export(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $section = $request->get('section');
        
        return Excel::download(new AttendanceExport($date, $section), "attendance-{$date}.xlsx");
    }
} 