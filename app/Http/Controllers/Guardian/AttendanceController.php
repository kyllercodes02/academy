<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the attendance records for the guardian's children.
     */
    public function index(): Response
    {
        $guardian = auth()->user();
        
        // Get the guardian's children
        $students = $guardian->students()->with(['section', 'attendances'])->get();
        
        // Get attendance records for all children
        $attendances = Attendance::whereIn('student_id', $students->pluck('id'))
            ->with(['student.section'])
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Guardian/Attendance/Index', [
            'students' => $students,
            'attendances' => $attendances,
        ]);
    }

    /**
     * Export attendance data for the guardian's children.
     */
    public function export()
    {
        $guardian = auth()->user();
        
        // Get the guardian's children
        $students = $guardian->students()->with(['section', 'attendances'])->get();
        
        // Get attendance records for all children
        $attendances = Attendance::whereIn('student_id', $students->pluck('id'))
            ->with(['student.section'])
            ->orderBy('date', 'desc')
            ->get();

        // Generate CSV export
        $filename = 'attendance_export_' . date('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($attendances) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, ['Student Name', 'Section', 'Date', 'Status', 'Time In', 'Time Out']);
            
            // Add data
            foreach ($attendances as $attendance) {
                fputcsv($file, [
                    $attendance->student->name,
                    $attendance->student->section->name ?? 'N/A',
                    $attendance->date,
                    $attendance->status,
                    $attendance->time_in ?? 'N/A',
                    $attendance->time_out ?? 'N/A',
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
} 