<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Section;
use App\Models\GradeLevel;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SF2Controller extends Controller
{
    /**
     * Display SF2 generation form for teachers
     */
    public function index()
    {
        $teacher = Auth::user();
        $teacherAssignment = $teacher->teacherAssignments()->with(['section', 'gradeLevel'])->first();

        if (!$teacherAssignment) {
            return Inertia::render('Teacher/Dashboard', [
                'message' => 'No section assigned yet.'
            ]);
        }

        return Inertia::render('Teacher/SF2Generation', [
            'section' => $teacherAssignment->section,
            'gradeLevel' => $teacherAssignment->gradeLevel,
        ]);
    }

    /**
     * Generate SF2 report for teacher's assigned section
     */
    public function generate(Request $request)
    {
        try {
            $request->validate([
                'month' => 'required|integer|between:1,12',
                'year' => 'required|integer|min:2020',
            ]);

            $teacher = Auth::user();
            $teacherAssignment = $teacher->teacherAssignments()->with(['section', 'gradeLevel'])->first();

            if (!$teacherAssignment) {
                return response()->json(['error' => 'No section assigned.'], 403);
            }

            $month = $request->input('month');
            $year = $request->input('year');
            $sectionId = $teacherAssignment->section_id;
            $gradeLevelId = $teacherAssignment->grade_level_id;

            // Get section and grade level details
            $section = $teacherAssignment->section;
            $gradeLevel = $teacherAssignment->gradeLevel;

            // Get students with attendance data for the specified month
            $students = Student::with(['attendances' => function($query) use ($month, $year) {
                $query->whereMonth('date', $month)
                      ->whereYear('date', $year);
            }])
            ->where('section_id', $sectionId)
            ->where('grade_level_id', $gradeLevelId)
            ->where('status', 'active')
            ->orderBy('gender')
            ->orderBy('name')
            ->get();

            // Separate students by gender
            $maleStudents = $students->where('gender', 'male');
            $femaleStudents = $students->where('gender', 'female');

            // Calculate summary statistics
            $summary = $this->calculateSummary($students, $month, $year);

            // Log the data being passed to the template
            \Log::info('SF2 Generation Data:', [
                'month' => $month,
                'year' => $year,
                'section' => $section->name,
                'grade_level' => $gradeLevel->name,
                'students_count' => $students->count(),
                'male_count' => $maleStudents->count(),
                'female_count' => $femaleStudents->count(),
            ]);

            // Generate PDF using simplified template
            $pdf = app('dompdf.wrapper');
            $pdf->loadView('pdf.sf2_simple', [
                'maleStudents' => $maleStudents,
                'femaleStudents' => $femaleStudents,
                'section' => $section,
                'gradeLevel' => $gradeLevel,
                'month' => $month,
                'year' => $year,
                'summary' => $summary,
            ]);

            $filename = "SF2_{$section->name}_{$gradeLevel->name}_{$month}_{$year}.pdf";
            
            // Store PDF in session for download
            $pdfContent = $pdf->output();
            session([
                'sf2_pdf_content' => base64_encode($pdfContent),
                'sf2_filename' => $filename
            ]);
            
            // Redirect back with success message
            return redirect()->back()->with('success', 'SF2 report generated successfully! Click the download button to get your PDF.');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('SF2 Generation Error: ' . $e->getMessage());
            \Log::error('SF2 Generation Stack Trace: ' . $e->getTraceAsString());
            
            // Return error response
            return response()->json([
                'error' => 'Failed to generate SF2 report: ' . $e->getMessage(),
                'details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            ], 500);
        }
    }

    /**
     * Download the generated SF2 PDF
     */
    public function download()
    {
        $pdfContent = session('sf2_pdf_content');
        $filename = session('sf2_filename');
        
        if (!$pdfContent || !$filename) {
            abort(404, 'PDF not found. Please generate the SF2 report first.');
        }
        
        // Clear session data
        session()->forget(['sf2_pdf_content', 'sf2_filename']);
        
        // Return PDF download
        return response(base64_decode($pdfContent))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Calculate summary statistics for the SF2 report
     */
    private function calculateSummary($students, $month, $year)
    {
        $totalStudents = $students->count();
        $maleCount = $students->where('gender', 'male')->count();
        $femaleCount = $students->where('gender', 'female')->count();

        // Calculate attendance statistics
        $totalPresent = 0;
        $totalAbsent = 0;
        $totalLate = 0;

        foreach ($students as $student) {
            foreach ($student->attendances as $attendance) {
                switch ($attendance->status) {
                    case 'present':
                        $totalPresent++;
                        break;
                    case 'absent':
                        $totalAbsent++;
                        break;
                    case 'late':
                        $totalLate++;
                        break;
                }
            }
        }

        // Calculate average daily attendance
        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
        $schoolDays = $this->getSchoolDaysInMonth($month, $year);
        $averageDailyAttendance = $schoolDays > 0 ? round($totalPresent / $schoolDays, 2) : 0;

        // Calculate percentages
        $percentageAttendance = $totalStudents > 0 ? round(($averageDailyAttendance / $totalStudents) * 100, 2) : 0;
        $percentageEnrolment = 100; // This would need to be calculated based on actual enrolment data

        return [
            'total_students' => $totalStudents,
            'male_count' => $maleCount,
            'female_count' => $femaleCount,
            'total_present' => $totalPresent,
            'total_absent' => $totalAbsent,
            'total_late' => $totalLate,
            'school_days' => $schoolDays,
            'average_daily_attendance' => $averageDailyAttendance,
            'percentage_attendance' => $percentageAttendance,
            'percentage_enrolment' => $percentageEnrolment,
        ];
    }

    /**
     * Get the number of school days in a month (excluding weekends)
     */
    private function getSchoolDaysInMonth($month, $year)
    {
        $daysInMonth = Carbon::create($year, $month, 1)->daysInMonth;
        $schoolDays = 0;

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::create($year, $month, $day);
            // Exclude weekends (Saturday = 6, Sunday = 0)
            if ($date->dayOfWeek !== 0 && $date->dayOfWeek !== 6) {
                $schoolDays++;
            }
        }

        return $schoolDays;
    }
}
