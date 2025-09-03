<?php

// app/Http/Controllers/Api/AttendanceController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Teacher;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AttendanceExport;
use App\Models\Section;

class AttendanceController extends Controller
{
    /**
     * Get attendance data for a specific date and section
     */
    public function index(Request $request)
    {
        $date = $request->input('date', now()->toDateString());
        $sectionId = $request->input('section');

        $query = Student::with(['section', 'gradeLevel', 'todayAttendance' => function ($query) use ($date) {
            $query->whereDate('created_at', $date);
        }]);

        if ($sectionId && $sectionId !== 'All Students') {
            $query->where('section_id', $sectionId);
        }

        $students = $query->orderBy('name')->get()->map(function ($student) {
            $attendance = $student->todayAttendance;
            return [
                'id' => $student->id,
                'name' => $student->name,
                'section' => $student->section ? $student->section->name : null,
                'grade_level' => $student->gradeLevel ? $student->gradeLevel->name : null,
                'attendance' => $attendance ? [
                    'id' => $attendance->id,
                    'status' => $attendance->status,
                    'check_in_time' => $attendance->check_in_time,
                    'check_out_time' => $attendance->check_out_time,
                ] : null,
            ];
        });

        $sections = Section::orderBy('name')->get();

        return Inertia::render('Admin/Attendance/Index', [
            'students' => $students,
            'sections' => $sections,
            'currentSection' => $sectionId ?? 'All Students',
            'currentDate' => $date,
        ]);
    }

    /**
     * Handle NFC card check-in
     */
    public function nfcCheckin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'card_id' => 'required|string',
            'date' => 'required|date',
            'section' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid data provided',
                'errors' => $validator->errors()
            ], 400);
        }

        $cardId = strtolower(trim($request->card_id));
        $date = $request->date;
        $section = $request->section;

        // Find student by card ID and section
        $student = Student::whereRaw('LOWER(card_id) = ?', [strtolower($cardId)])
            ->where('student_section', $section)
            ->where('status', 'active')
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found or card not registered for this section'
            ]);
        }

        // Check if already checked in today
        $existingAttendance = Attendance::where('student_id', $student->id)
            ->where('date', $date)
            ->first();

        $currentTime = Carbon::now();
        $schoolStartTime = Carbon::createFromTime(8, 0, 0); // 8:00 AM
        $lateThreshold = Carbon::createFromTime(8, 30, 0);  // 8:30 AM

        // Determine status based on check-in time
        $status = 'present';
        if ($currentTime->greaterThan($lateThreshold)) {
            $status = 'late';
        }

        if ($existingAttendance) {
            // Update existing record
            $existingAttendance->update([
                'status' => $status,
                'check_in_time' => $currentTime->format('H:i:s'),
                'updated_at' => $currentTime
            ]);

            event(new \App\Events\AttendanceUpdated(
                $student->id,
                $status,
                $currentTime->format('H:i:s'),
                null,
                null
            ));

            return response()->json([
                'success' => true,
                'message' => 'Attendance updated successfully',
                'student_name' => $student->name,
                'status' => $status,
                'check_in_time' => $currentTime->format('H:i:s'),
                'already_exists' => true
            ]);
        } else {
            // Create new attendance record
            $created = Attendance::create([
                'student_id' => $student->id,
                'date' => $date,
                'status' => $status,
                'check_in_time' => $currentTime->format('H:i:s'),
                'created_at' => $currentTime,
                'updated_at' => $currentTime
            ]);

            event(new \App\Events\AttendanceUpdated(
                $student->id,
                $status,
                $currentTime->format('H:i:s'),
                null,
                null
            ));

            return response()->json([
                'success' => true,
                'message' => 'Attendance recorded successfully',
                'student_name' => $student->name,
                'status' => $status,
                'check_in_time' => $currentTime->format('H:i:s'),
                'already_exists' => false
            ]);
        }
    }

    /**
     * Update attendance status manually
     */
    public function updateAttendance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid data provided',
                'errors' => $validator->errors()
            ], 400);
        }

        $student = Student::findOrFail($request->student_id);

        // Check if teacher has access to this student's section
        if (Auth::user()->role === 'teacher' && !Auth::user()->canAccessSection($student->student_section, $student->grade_level)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this section'
            ], 403);
        }

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'date' => $request->date
            ],
            [
                'status' => $request->status,
                'remarks' => $request->remarks ?? null
            ]
        );

        event(new \App\Events\AttendanceUpdated(
            $request->student_id,
            $attendance->status,
            $attendance->check_in_time,
            $attendance->check_out_time,
            $attendance->remarks
        ));

        return response()->json([
            'success' => true,
            'message' => 'Attendance updated successfully',
            'student_name' => $student->name,
            'status' => $request->status
        ]);
    }

    /**
     * Bulk update attendance for all students in a section
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'section' => 'required|string',
            'status' => 'required|in:present,late,absent',
            'date' => 'required|date',
        ]);

        $user = Auth::user();
        if (!$user->canManageSection($request->section)) {
            return response()->json(['message' => 'You do not have permission to manage this section.'], 403);
        }

        try {
            DB::beginTransaction();

            $students = Student::where('student_section', $request->section)->get();

            foreach ($students as $student) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'date' => $request->date,
                    ],
                    [
                        'status' => $request->status,
                        'remarks' => null,
                    ]
                );
            }

            DB::commit();
            return response()->json(['message' => 'Attendance updated successfully for all students.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error updating attendance.'], 500);
        }
    }

    /**
     * Get attendance statistics for a specific date and section
     */
    public function getStats(Request $request)
    {
        $date = $request->get('date', Carbon::today()->format('Y-m-d'));
        $section = $request->get('section');

        $query = Attendance::where('date', $date);
        
        if ($section) {
            $studentIds = Student::where('student_section', $section)
                ->where('status', 'active')
                ->pluck('id');
            $query->whereIn('student_id', $studentIds);
        }

        $stats = $query->selectRaw('
            status,
            COUNT(*) as count
        ')
        ->groupBy('status')
        ->pluck('count', 'status')
        ->toArray();

        // Get total students count
        $totalStudents = $section 
            ? Student::where('student_section', $section)->where('status', 'active')->count()
            : Student::where('status', 'active')->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'present' => $stats['present'] ?? 0,
                'absent' => $stats['absent'] ?? 0,
                'late' => $stats['late'] ?? 0,
                'total' => $totalStudents
            ],
            'date' => $date,
            'section' => $section
        ]);
    }

    public function viewHistory(Request $request, Student $student)
    {
        $attendanceHistory = $student->attendances()
            ->orderBy('date', 'desc')
            ->paginate(10);

        return Inertia::render('Attendance/History', [
            'student' => $student,
            'history' => $attendanceHistory
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'status' => 'required|in:present,late,absent',
            'date' => 'required|date',
            'remarks' => 'nullable|string|max:255',
        ]);

        $student = Student::findOrFail($request->student_id);
        $user = Auth::user();
        
        if (!$user->canManageSection($student->student_section)) {
            return response()->json(['message' => 'You do not have permission to manage this section.'], 403);
        }

        try {
            DB::beginTransaction();

            $attendance = Attendance::updateOrCreate(
                [
                    'student_id' => $request->student_id,
                    'date' => $request->date,
                ],
                [
                    'status' => $request->status,
                    'remarks' => $request->remarks,
                ]
            );

            DB::commit();
            return response()->json(['message' => 'Attendance updated successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error updating attendance.'], 500);
        }
    }

    public function export(Request $request)
    {
        $date = $request->input('date', now()->toDateString());
        $sectionId = $request->input('section');

        $query = Student::with(['section', 'gradeLevel', 'todayAttendance' => function ($query) use ($date) {
            $query->whereDate('created_at', $date);
        }]);

        if ($sectionId && $sectionId !== 'All Students') {
            $query->where('section_id', $sectionId);
        }

        $students = $query->orderBy('name')->get();

        $filename = 'attendance_' . $date . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($students) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Name', 'Section', 'Grade Level', 'Status', 'Check In Time', 'Check Out Time']);

            foreach ($students as $student) {
                $attendance = $student->todayAttendance;
                fputcsv($file, [
                    $student->name,
                    $student->section ? $student->section->name : 'N/A',
                    $student->gradeLevel ? $student->gradeLevel->name : 'N/A',
                    $attendance ? $attendance->status : 'absent',
                    $attendance ? Carbon::parse($attendance->check_in_time)->format('g:i A') : 'N/A',
                    $attendance && $attendance->check_out_time ? Carbon::parse($attendance->check_out_time)->format('g:i A') : 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function getData(Request $request)
    {
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $section = $request->input('section', 'All Students');

        $query = Student::query()
            ->with(['attendances' => function ($query) use ($date) {
                $query->whereDate('date', $date);
            }]);

        if ($section !== 'All Students') {
            $query->where('student_section', $section);
        }

        $students = $query->get()->map(function ($student) {
            $attendance = $student->attendances->first();
            return [
                'id' => $student->id,
                'name' => $student->name,
                'section' => $student->student_section,
                'status' => $attendance ? $attendance->status : 'absent'
            ];
        });

        return response()->json(['students' => $students]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late',
            'remarks' => 'nullable|string|max:255'
        ]);

        $student = Student::findOrFail($request->student_id);
        
        // Check teacher authorization
        if (Auth::user()->role === 'teacher') {
            $teacher = Teacher::where('email', Auth::user()->email)->first();
            if (!$teacher->canManageSection($student->student_section, $student->grade_level)) {
                abort(403, 'Unauthorized access to this student\'s attendance');
            }
        }

        Attendance::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'date' => $request->date,
            ],
            [
                'status' => $request->status,
                'remarks' => $request->remarks
            ]
        );

        return response()->json(['message' => 'Attendance updated successfully']);
    }
}