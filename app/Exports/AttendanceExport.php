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
            ->with(['attendances' => function($query) {
                $query->where('date', $this->date);
            }, 'section'])
            ->where('status', 'active');

        if ($this->section && $this->section !== 'all') {
            $query->where('section_id', $this->section);
        }

        return $query->orderBy('section_id')
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
        $attendance = $student->attendances->first();

        return [
            $student->id,
            $student->name,
            $student->section?->name ?? 'N/A',
            $attendance ? $attendance->status : 'absent',
            $attendance ? $attendance->check_in_time : '-',
            $attendance ? $attendance->remarks : '-',
        ];
    }
} 