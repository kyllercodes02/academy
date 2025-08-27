<?php

namespace App\Imports;

use App\Models\Student;
use App\Models\Section;
use App\Models\GradeLevel;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentImport implements ToModel, WithHeadingRow, WithValidation
{
    use Importable;

    public function model(array $row)
    {
        // Find or create the Section and GradeLevel
        $section = Section::firstOrCreate(['name' => $row['section']]);
        // Handle grade level creation with required 'level' field
        $gradeLevelName = $row['grade_level'];
        $level = null;
        if (preg_match('/Grade[\s_-]*(\d+)/i', $gradeLevelName, $matches)) {
            $level = (int)$matches[1];
        } elseif (is_numeric($gradeLevelName)) {
            $level = (int)$gradeLevelName;
        } else {
            // If cannot determine level, set to 0 or handle as needed
            $level = 0;
        }
        $gradeLevel = GradeLevel::firstOrCreate(
            ['name' => $gradeLevelName],
            ['level' => $level]
        );

        // Use firstOrNew to avoid issues with unique constraints on card_id during checks,
        // and then update the details. This handles both new students and updates to existing ones.
        $student = Student::firstOrNew([
            'name' => $row['name'],
            'section_id' => $section->id,
            'grade_level_id' => $gradeLevel->id,
        ]);

        // Assign or update other attributes
        $student->status = strtolower($row['status'] ?? 'active');
        
        // Only assign card_id if it's provided and not empty
        if (!empty($row['card_id'])) {
            $student->card_id = $row['card_id'];
        }

        $student->save();

        return $student;
    }

    public function rules(): array
    {
        return [
            '*.name' => 'required|string|max:255',
            '*.section' => 'required|string',
            '*.grade_level' => 'required|string',
            '*.status' => 'nullable|in:active,inactive',
            '*.card_id' => 'nullable|string|max:50|unique:students,card_id',
        ];
    }
} 