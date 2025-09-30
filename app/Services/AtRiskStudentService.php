<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AtRiskStudentService
{
    /**
     * Get at-risk students based on attendance patterns
     */
    public function getAtRiskStudents($sectionId = null, $days = 30)
    {
        $query = Student::query()
            ->with(['section', 'gradeLevel', 'attendances' => function ($query) use ($days) {
                $query->whereDate('date', '>=', Carbon::now()->subDays($days))
                    ->whereDate('date', '<=', Carbon::now());
            }])
            ->where('status', 'active');

        if ($sectionId && $sectionId !== 'all') {
            $query->where('section_id', $sectionId);
        }

        $students = $query->get();

        return $students->map(function ($student) use ($days) {
            $attendanceData = $this->calculateAttendanceMetrics($student, $days);
            
            if ($attendanceData['is_at_risk']) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'section' => $student->section?->name,
                    'grade_level' => $student->gradeLevel?->name,
                    'photo_url' => $student->photo_url,
                    'attendance_rate' => $attendanceData['attendance_rate'],
                    'absent_days' => $attendanceData['absent_days'],
                    'late_days' => $attendanceData['late_days'],
                    'consecutive_absent' => $attendanceData['consecutive_absent'],
                    'risk_level' => $attendanceData['risk_level'],
                    'risk_factors' => $attendanceData['risk_factors'],
                    'last_attendance' => $attendanceData['last_attendance'],
                ];
            }
            return null;
        })->filter()->values();
    }

    /**
     * Calculate attendance metrics for a student
     */
    private function calculateAttendanceMetrics($student, $days)
    {
        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();
        
        $attendances = $student->attendances->where('date', '>=', $startDate->toDateString());
        
        $totalDays = $this->getSchoolDays($startDate, $endDate);
        $presentDays = $attendances->where('status', 'present')->count();
        $absentDays = $attendances->where('status', 'absent')->count();
        $lateDays = $attendances->where('status', 'late')->count();
        
        $attendanceRate = $totalDays > 0 ? round(($presentDays + $lateDays) / $totalDays * 100, 1) : 0;
        
        // Calculate consecutive absent days
        $consecutiveAbsent = $this->calculateConsecutiveAbsentDays($student, $endDate);
        
        // Determine risk factors
        $riskFactors = [];
        $riskLevel = 'low';
        
        if ($attendanceRate < 70) {
            $riskFactors[] = 'Low attendance rate (' . $attendanceRate . '%)';
            $riskLevel = 'high';
        } elseif ($attendanceRate < 85) {
            $riskFactors[] = 'Below average attendance (' . $attendanceRate . '%)';
            $riskLevel = 'medium';
        }
        
        if ($consecutiveAbsent >= 5) {
            $riskFactors[] = 'Extended absence (' . $consecutiveAbsent . ' days)';
            $riskLevel = 'high';
        } elseif ($consecutiveAbsent >= 3) {
            $riskFactors[] = 'Recent absence streak (' . $consecutiveAbsent . ' days)';
            $riskLevel = 'medium';
        }
        
        if ($lateDays >= 5) {
            $riskFactors[] = 'Frequent tardiness (' . $lateDays . ' times)';
            if ($riskLevel === 'low') $riskLevel = 'medium';
        }
        
        $lastAttendance = $attendances->sortByDesc('date')->first();
        
        return [
            'attendance_rate' => $attendanceRate,
            'absent_days' => $absentDays,
            'late_days' => $lateDays,
            'consecutive_absent' => $consecutiveAbsent,
            'risk_level' => $riskLevel,
            'risk_factors' => $riskFactors,
            'last_attendance' => $lastAttendance ? $lastAttendance->date->format('Y-m-d') : null,
            'is_at_risk' => !empty($riskFactors),
        ];
    }

    /**
     * Calculate consecutive absent days
     */
    private function calculateConsecutiveAbsentDays($student, $endDate)
    {
        $consecutiveDays = 0;
        $currentDate = $endDate->copy();
        
        while ($currentDate->gte(Carbon::now()->subDays(30))) {
            $attendance = $student->attendances->where('date', $currentDate->toDateString())->first();
            
            if (!$attendance || $attendance->status === 'absent') {
                $consecutiveDays++;
            } else {
                break;
            }
            
            $currentDate->subDay();
        }
        
        return $consecutiveDays;
    }

    /**
     * Get school days (excluding weekends)
     */
    private function getSchoolDays($startDate, $endDate)
    {
        $days = 0;
        $current = $startDate->copy();
        
        while ($current->lte($endDate)) {
            // Count weekdays only (Monday to Friday)
            if ($current->dayOfWeek >= 1 && $current->dayOfWeek <= 5) {
                $days++;
            }
            $current->addDay();
        }
        
        return $days;
    }

    /**
     * Get at-risk statistics for dashboard
     */
    public function getAtRiskStatistics($sectionId = null)
    {
        $atRiskStudents = $this->getAtRiskStudents($sectionId);
        
        $highRisk = $atRiskStudents->where('risk_level', 'high')->count();
        $mediumRisk = $atRiskStudents->where('risk_level', 'medium')->count();
        $lowRisk = $atRiskStudents->where('risk_level', 'low')->count();
        
        return [
            'total_at_risk' => $atRiskStudents->count(),
            'high_risk' => $highRisk,
            'medium_risk' => $mediumRisk,
            'low_risk' => $lowRisk,
            'students' => $atRiskStudents,
        ];
    }
}
