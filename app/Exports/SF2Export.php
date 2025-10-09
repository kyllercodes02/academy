<?php

namespace App\Exports;

use App\Models\Student;
use App\Models\Attendance;
use App\Models\Section;
use App\Models\GradeLevel;
use App\Models\Setting;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

class SF2Export implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents, WithTitle
{
    protected $year;
    protected $month;
    protected $sectionId;
    protected $gradeLevel;
    protected $section;
    protected $schoolSettings;

    public function __construct($year, $month, $sectionId)
    {
        $this->year = $year;
        $this->month = $month;
        $this->sectionId = $sectionId;
        $this->section = Section::find($sectionId);
        $this->gradeLevel = $this->section ? $this->section->gradeLevel : null;
        $this->schoolSettings = $this->getSchoolSettings();
    }

    public function title(): string
    {
        return 'SF2 - Daily Attendance';
    }

    public function collection()
    {
        $daysInMonth = date('t', mktime(0, 0, 0, $this->month, 1, $this->year));
        $schoolDays = [];
        
        for($day = 1; $day <= $daysInMonth; $day++) {
            $dayOfWeek = date('N', mktime(0, 0, 0, $this->month, $day, $this->year));
            if($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                $schoolDays[] = $day;
            }
        }

        $students = Student::with(['attendances' => function($query) {
            $query->whereYear('date', $this->year)
                  ->whereMonth('date', $this->month);
        }])
        ->where('section_id', $this->sectionId)
        ->where('status', 'active')
        ->orderBy('gender')
        ->orderBy('name')
        ->get();

        // Add school days and students data to collection
        $data = collect([
            'school_days' => $schoolDays,
            'students' => $students,
            'days_count' => count($schoolDays)
        ]);

        return $data;
    }

    public function headings(): array
    {
        $daysInMonth = date('t', mktime(0, 0, 0, $this->month, 1, $this->year));
        $schoolDays = [];
        $dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        for($day = 1; $day <= $daysInMonth; $day++) {
            $dayOfWeek = date('N', mktime(0, 0, 0, $this->month, $day, $this->year));
            if($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                $schoolDays[] = $day;
            }
        }

        $headings = [
            'A' => 'LEARNER\'S NAME (Last Name, First Name, Middle Name)',
            'B' => 'LRN',
            'C' => 'Sex'
        ];

        // Add day columns
        $col = 'D';
        foreach($schoolDays as $day) {
            $dayOfWeek = date('N', mktime(0, 0, 0, $this->month, $day, $this->year));
            $dayName = $dayNames[$dayOfWeek - 1];
            $headings[$col] = "{$day} {$dayName}";
            $col++;
        }

        $headings[$col++] = 'Total for the Month';
        $headings[$col++] = 'ABSENT';
        $headings[$col++] = 'TARDY';
        $headings[$col++] = 'REMARKS';

        return $headings;
    }

    public function map($data): array
    {
        // This will be handled in the AfterSheet event for complex layout
        return [];
    }

    public function columnWidths(): array
    {
        $widths = [
            'A' => 25, // Learner's Name
            'B' => 15, // LRN
            'C' => 8,  // Sex
        ];

        // Add day columns (narrow width)
        $daysInMonth = date('t', mktime(0, 0, 0, $this->month, 1, $this->year));
        $schoolDays = [];
        
        for($day = 1; $day <= $daysInMonth; $day++) {
            $dayOfWeek = date('N', mktime(0, 0, 0, $this->month, $day, $this->year));
            if($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                $schoolDays[] = $day;
            }
        }

        $col = 'D';
        foreach($schoolDays as $day) {
            $widths[$col] = 6;
            $col++;
        }

        $widths[$col++] = 12; // Total for the Month
        $widths[$col++] = 8;  // ABSENT
        $widths[$col++] = 8;  // TARDY
        $widths[$col++] = 20; // REMARKS

        return $widths;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Header styles will be applied in AfterSheet event
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                try {
                    $sheet = $event->sheet->getDelegate();
                    $data = $this->collection();
                    $schoolDays = $data['school_days'];
                    $students = $data['students'];
                    $daysCount = $data['days_count'];

                // Set page setup
                $sheet->getPageSetup()
                    ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE)
                    ->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4)
                    ->setFitToWidth(1)
                    ->setFitToHeight(false);

                // Set print area
                $lastColumn = $this->getColumnLetter(3 + $daysCount + 4); // A + B + C + days + 4 summary columns
                $lastRow = 50 + $students->count(); // Estimated rows
                $sheet->getPageSetup()->setPrintArea("A1:{$lastColumn}{$lastRow}");

                $currentRow = 1;

                // Header Section
                $this->addHeaderSection($sheet, $currentRow);
                $currentRow += 8;

                // Form Information
                $this->addFormInfo($sheet, $currentRow);
                $currentRow += 3;

                // Main Table Header
                $this->addTableHeader($sheet, $currentRow, $schoolDays);
                $currentRow += 3;

                // Student Data
                $maleStudents = $students->where('gender', 'male');
                $femaleStudents = $students->where('gender', 'female');

                // Male Students
                if ($maleStudents->count() > 0) {
                    foreach ($maleStudents as $student) {
                        $this->addStudentRow($sheet, $currentRow, $student, $schoolDays);
                        $currentRow++;
                    }
                    
                    // Male Total Row
                    $this->addGenderTotalRow($sheet, $currentRow, 'MALE', $schoolDays);
                    $currentRow++;
                }

                // Female Students
                if ($femaleStudents->count() > 0) {
                    foreach ($femaleStudents as $student) {
                        $this->addStudentRow($sheet, $currentRow, $student, $schoolDays);
                        $currentRow++;
                    }
                    
                    // Female Total Row
                    $this->addGenderTotalRow($sheet, $currentRow, 'FEMALE', $schoolDays);
                    $currentRow++;
                }

                // Combined Total Row
                $this->addCombinedTotalRow($sheet, $currentRow, $schoolDays);
                $currentRow += 2;

                // Summary Section
                $this->addSummarySection($sheet, $currentRow, $students, $daysCount);

                    // Apply borders and styling
                    $this->applyStyling($sheet, $currentRow, $schoolDays);
                } catch (\Exception $e) {
                    \Log::error('SF2Export AfterSheet Error: ' . $e->getMessage());
                    \Log::error('SF2Export AfterSheet Stack Trace: ' . $e->getTraceAsString());
                    throw $e;
                }
            },
        ];
    }

    private function addHeaderSection($sheet, $startRow)
    {
        // Republic of the Philippines
        $sheet->mergeCells("A{$startRow}:H{$startRow}");
        $sheet->setCellValue("A{$startRow}", 'REPUBLIC OF THE PHILIPPINES');
        $sheet->getStyle("A{$startRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
        $startRow++;

        // Department of Education
        $sheet->mergeCells("A{$startRow}:H{$startRow}");
        $sheet->setCellValue("A{$startRow}", 'DEPARTMENT OF EDUCATION');
        $sheet->getStyle("A{$startRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
        $startRow++;

        // Form Title
        $sheet->mergeCells("A{$startRow}:H{$startRow}");
        $sheet->setCellValue("A{$startRow}", 'School Form 2 (SF2) Daily Attendance Report of Learners');
        $sheet->getStyle("A{$startRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 16],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
        $startRow++;

        // Subtitle
        $sheet->mergeCells("A{$startRow}:H{$startRow}");
        $sheet->setCellValue("A{$startRow}", '(This replaces Form 1, Form 2 & STS Form 4 - Absenteeism and Dropout Profile)');
        $sheet->getStyle("A{$startRow}")->applyFromArray([
            'font' => ['italic' => true, 'size' => 8],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
    }

    private function addFormInfo($sheet, $startRow)
    {
        $schoolId = $this->schoolSettings['school_id'] ?? 'N/A';
        $schoolYear = $this->year . '-' . ($this->year + 1);
        $monthLabel = date('F Y', mktime(0, 0, 0, $this->month, 1, $this->year));
        $schoolName = $this->schoolSettings['school_name'] ?? 'SAMPLE SCHOOL';
        $gradeLevel = $this->gradeLevel ? $this->gradeLevel->name : 'N/A';
        $section = $this->section ? $this->section->name : 'N/A';

        // Row 1: School ID, School Year, Report Month
        $sheet->setCellValue("A{$startRow}", 'School ID:');
        $sheet->setCellValue("B{$startRow}", $schoolId);
        $sheet->setCellValue("C{$startRow}", 'School Year:');
        $sheet->setCellValue("D{$startRow}", $schoolYear);
        $sheet->setCellValue("E{$startRow}", 'Report for the Month of:');
        $sheet->setCellValue("F{$startRow}", $monthLabel);
        
        $sheet->getStyle("A{$startRow}:F{$startRow}")->applyFromArray([
            'font' => ['size' => 9, 'bold' => true]
        ]);

        $startRow++;

        // Row 2: School Name, Grade Level, Section
        $sheet->setCellValue("A{$startRow}", 'Name of School:');
        $sheet->mergeCells("B{$startRow}:D{$startRow}");
        $sheet->setCellValue("B{$startRow}", $schoolName);
        $sheet->setCellValue("E{$startRow}", 'Grade Level:');
        $sheet->setCellValue("F{$startRow}", $gradeLevel);
        
        $sheet->getStyle("A{$startRow}:F{$startRow}")->applyFromArray([
            'font' => ['size' => 9, 'bold' => true]
        ]);

        $startRow++;

        // Row 3: Section
        $sheet->setCellValue("A{$startRow}", 'Section:');
        $sheet->mergeCells("B{$startRow}:F{$startRow}");
        $sheet->setCellValue("B{$startRow}", $section);
        
        $sheet->getStyle("A{$startRow}:F{$startRow}")->applyFromArray([
            'font' => ['size' => 9, 'bold' => true]
        ]);
    }

    private function addTableHeader($sheet, $startRow, $schoolDays)
    {
        $col = 'A';
        
        // First row
        $sheet->setCellValue("{$col}{$startRow}", 'LEARNER\'S NAME');
        $col++;
        $sheet->setCellValue("{$col}{$startRow}", 'LRN');
        $col++;
        $sheet->setCellValue("{$col}{$startRow}", 'Sex');
        $col++;

        // Merge cells for school days
        $dayStartCol = $col;
        foreach ($schoolDays as $day) {
            $col++;
        }
        $dayEndCol = Coordinate::stringFromColumnIndex(Coordinate::columnIndexFromString($col) - 1);
        
        if ($dayStartCol <= $dayEndCol) {
            $sheet->mergeCells("{$dayStartCol}{$startRow}:{$dayEndCol}{$startRow}");
            $sheet->setCellValue("{$dayStartCol}{$startRow}", '(1st row for date)');
        }

        $sheet->setCellValue("{$col}{$startRow}", 'Total for the Month');
        $col++;
        $sheet->setCellValue("{$col}{$startRow}", 'ABSENT');
        $col++;
        $sheet->setCellValue("{$col}{$startRow}", 'TARDY');
        $col++;
        $sheet->setCellValue("{$col}{$startRow}", 'REMARKS');

        $startRow++;

        // Second row - day headers
        $col = 'D';
        $dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        
        foreach ($schoolDays as $day) {
            $dayOfWeek = date('N', mktime(0, 0, 0, $this->month, $day, $this->year));
            $dayName = $dayNames[$dayOfWeek - 1];
            $sheet->setCellValue("{$col}{$startRow}", "{$day} {$dayName}");
            $col++;
        }

        // Apply header styling
        $lastCol = $this->getColumnLetter(3 + count($schoolDays) + 4);
        $sheet->getStyle("A{$startRow}:{$lastCol}" . ($startRow - 1))->applyFromArray([
            'font' => ['bold' => true, 'size' => 7],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0F0F0']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ]);
    }

    private function addStudentRow($sheet, $row, $student, $schoolDays)
    {
        $col = 'A';
        
        // Student name
        $sheet->setCellValue("{$col}{$row}", strtoupper($student->name));
        $col++;
        
        // LRN
        $sheet->setCellValue("{$col}{$row}", $student->lrn ?? '');
        $col++;
        
        // Sex
        $sheet->setCellValue("{$col}{$row}", strtoupper(substr($student->gender, 0, 1)));
        $col++;

        // Daily attendance cells with formulas
        $attendanceCols = [];
        foreach ($schoolDays as $day) {
            $attendanceDate = $this->year . '-' . str_pad($this->month, 2, '0', STR_PAD_LEFT) . '-' . str_pad($day, 2, '0', STR_PAD_LEFT);
            $attendance = $student->attendances->where('date', $attendanceDate)->first();
            
            if ($attendance) {
                $status = $attendance->status;
                if ($status === 'present') {
                    $sheet->setCellValue("{$col}{$row}", '');
                } elseif ($status === 'absent') {
                    $sheet->setCellValue("{$col}{$row}", '/');
                } elseif ($status === 'late') {
                    $sheet->setCellValue("{$col}{$row}", 'T');
                }
            }
            
            $attendanceCols[] = $col;
            $col++;
        }

        // Total for the Month formula
        $startCol = $this->getColumnLetter(3 + 1);
        $endCol = $this->getColumnLetter(3 + count($schoolDays));
        $sheet->setCellValue("{$col}{$row}", "=COUNTBLANK({$startCol}{$row}:{$endCol}{$row})");
        $col++;

        // ABSENT formula
        $sheet->setCellValue("{$col}{$row}", "=COUNTIF({$startCol}{$row}:{$endCol}{$row},\"/\")");
        $col++;

        // TARDY formula
        $sheet->setCellValue("{$col}{$row}", "=COUNTIF({$startCol}{$row}:{$endCol}{$row},\"T\")");
        $col++;

        // REMARKS
        $sheet->setCellValue("{$col}{$row}", $student->remarks ?? '');

        // Apply row styling
        $lastCol = $this->getColumnLetter(3 + count($schoolDays) + 4);
        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
            'font' => ['size' => 7],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ]);

        // Center attendance columns
        if (!empty($attendanceCols)) {
            $startCol = $attendanceCols[0];
            $endCol = end($attendanceCols);
            $sheet->getStyle("{$startCol}{$row}:{$endCol}{$row}")->applyFromArray([
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
        }
    }

    private function addGenderTotalRow($sheet, $row, $gender, $schoolDays)
    {
        $col = 'A';
        
        // Gender total label
        $sheet->setCellValue("{$col}{$row}", "⟵ {$gender} | TOTAL Per Day ⟶");
        $col++;
        $col++; // Skip LRN
        $col++; // Skip Sex

        // Daily totals (empty for now, can be calculated if needed)
        foreach ($schoolDays as $day) {
            $col++;
        }

        // Summary columns
        $col++;
        $col++;
        $col++;
        $col++;

        // Apply styling
        $lastCol = $this->getColumnLetter(3 + count($schoolDays) + 4);
        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 8],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E8E8E8']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ]);
    }

    private function addCombinedTotalRow($sheet, $row, $schoolDays)
    {
        $col = 'A';
        
        // Combined total label
        $sheet->setCellValue("{$col}{$row}", 'Combined TOTAL PER DAY');
        $col++;
        $col++; // Skip LRN
        $col++; // Skip Sex

        // Daily totals (empty for now)
        foreach ($schoolDays as $day) {
            $col++;
        }

        // Summary columns
        $col++;
        $col++;
        $col++;
        $col++;

        // Apply styling
        $lastCol = $this->getColumnLetter(3 + count($schoolDays) + 4);
        $sheet->getStyle("A{$row}:{$lastCol}{$row}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 8],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D0D0D0']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
        ]);
    }

    private function addSummarySection($sheet, $startRow, $students, $daysCount)
    {
        $maleCount = $students->where('gender', 'male')->count();
        $femaleCount = $students->where('gender', 'female')->count();
        $totalStudents = $students->count();

        // Guidelines section
        $sheet->setCellValue("A{$startRow}", 'GUIDELINES:');
        $sheet->getStyle("A{$startRow}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 7]
        ]);
        $startRow++;

        $guidelines = [
            '1. The attendance shall be accomplished daily. Refer to the codes for checking learners\' attendance.',
            '2. Learner\'s Name shall be written in the following format: Last Name, First Name, Middle Name.',
            '3. To compute the following:',
            '',
            'a. Percentage of Enrollment =',
            '   Registered Learners as of end of the month × 100',
            '   Enrolled at the Beginning of School year',
            '',
            'b. Average Daily Attendance =',
            '   Total Daily Attendance',
            '   Number of School Days in reporting month',
            '',
            'c. Percentage of Attendance for the month =',
            '   Average daily attendance × 100',
            '   Registered Learners as of end of the month'
        ];

        foreach ($guidelines as $guideline) {
            $sheet->setCellValue("A{$startRow}", $guideline);
            $startRow++;
        }

        // Summary table
        $startRow += 2;
        $sheet->setCellValue("A{$startRow}", 'Month: ' . date('F Y', mktime(0, 0, 0, $this->month, 1, $this->year)));
        $startRow++;
        $sheet->setCellValue("A{$startRow}", 'No. of Days of Classes: ' . $daysCount);
        $startRow += 2;

        // Summary table
        $sheet->setCellValue("A{$startRow}", 'Summary');
        $sheet->setCellValue("B{$startRow}", 'M');
        $sheet->setCellValue("C{$startRow}", 'F');
        $sheet->setCellValue("D{$startRow}", 'TOTAL');
        $startRow++;

        $sheet->setCellValue("A{$startRow}", 'Enrollment');
        $sheet->setCellValue("B{$startRow}", $maleCount);
        $sheet->setCellValue("C{$startRow}", $femaleCount);
        $sheet->setCellValue("D{$startRow}", $totalStudents);

        // Apply summary table styling
        $sheet->getStyle("A" . ($startRow - 1) . ":D{$startRow}")->applyFromArray([
            'font' => ['size' => 6],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0F0F0']]
        ]);

        $startRow += 3;

        // Additional summary information
        $summaryInfo = [
            '* Enrollment as of (1st Friday of June)',
            'Late Enrollment during the month (Beyond cut-off)',
            'Registered Learners as of end of the month: ' . $totalStudents,
            'Percentage of Enrollment as of end of the month: N/A%',
            'Average Daily Attendance: N/A',
            'Percentage of Attendance for the month: N/A%',
            'Number of students absent for 5 consecutive days: ___',
            'Drop out: ___',
            'Transferred out: ___',
            'Transferred in: ___'
        ];

        foreach ($summaryInfo as $info) {
            $sheet->setCellValue("A{$startRow}", $info);
            $sheet->getStyle("A{$startRow}")->applyFromArray([
                'font' => ['size' => 6]
            ]);
            $startRow++;
        }

        // Signature section
        $startRow += 2;
        $sheet->setCellValue("A{$startRow}", 'I certify that this is a true and correct report.');
        $startRow += 2;
        $sheet->setCellValue("A{$startRow}", '(Signature of Teacher over Printed Name)');
        $startRow += 2;
        $sheet->setCellValue("A{$startRow}", 'Attested by:');
        $startRow += 2;
        $sheet->setCellValue("A{$startRow}", '(Signature of School Head over Printed Name)');
    }

    private function applyStyling($sheet, $lastRow, $schoolDays)
    {
        // Freeze panes at row 12 (after headers)
        $sheet->freezePane('A12');

        // Set row heights
        for ($row = 1; $row <= $lastRow; $row++) {
            if ($row <= 8) {
                $sheet->getRowDimension($row)->setRowHeight(15);
            } else {
                $sheet->getRowDimension($row)->setRowHeight(12);
            }
        }

        // Apply borders to the entire data area
        $lastCol = $this->getColumnLetter(3 + count($schoolDays) + 4);
        $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM]]
        ]);
    }

    private function getColumnLetter($columnNumber)
    {
        // Handle edge cases
        if ($columnNumber <= 0) {
            return 'A';
        }
        
        $columnLetter = '';
        while ($columnNumber > 0) {
            $columnNumber--;
            $columnLetter = chr($columnNumber % 26 + 65) . $columnLetter;
            $columnNumber = intval($columnNumber / 26);
        }
        return $columnLetter;
    }

    private function getSchoolSettings()
    {
        $settings = Setting::whereIn('key', ['school_id', 'school_name'])->get();
        $result = [];
        
        foreach ($settings as $setting) {
            $result[$setting->key] = $setting->value;
        }
        
        return $result;
    }
}
