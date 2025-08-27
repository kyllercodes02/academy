<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'section_id',
        'grade_level_id',
        'academic_year',
    ];

    protected $casts = [
        'academic_year' => 'string',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function gradeLevel()
    {
        return $this->belongsTo(GradeLevel::class);
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_teacher_sections')
            ->withTimestamps();
    }
} 