<?php

namespace App\Exports;

use App\Models\Student;
use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class AttendanceExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $date;
    protected $section;

    public function __construct($date, $section = null)
    {
        $this->date = $date;
        $this->section = $section;
    }

    public function collection()
    {
        $query = Student::query()
            ->with(['attendance' => function($query) {
                $query->where('date', $this->date);
            }])
            ->where('status', 'active');

        if ($this->section && $this->section !== 'All Students') {
            $query->where('student_section', $this->section);
        }

        return $query->orderBy('student_section')
            ->orderBy('name')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Student ID',
            'Name',
            'Section',
            'Status',
            'Check In Time',
            'Remarks',
        ];
    }

    public function map($student): array
    {
        $attendance = $student->attendance->first();

        return [
            $student->id,
            $student->name,
            $student->student_section,
            $attendance ? $attendance->status : 'absent',
            $attendance ? $attendance->check_in_time : '-',
            $attendance ? $attendance->remarks : '-',
        ];
    }
} 