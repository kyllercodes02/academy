<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Teacher extends Authenticatable
{
    use HasFactory, Notifiable;

    // Define the table name (optional if it's following Laravel's conventions)
    protected $table = 'teachers';

    // Define which fields are mass assignable
    protected $fillable = [
        'name',
        'email',
        'subject',
        'phone',
        'status',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Define validation rules
    public static function rules($id = null)
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:teachers,email' . ($id ? ',' . $id : ''),
            'subject' => 'required|string|max:255',
            'phone' => 'nullable|string|max:15',
            'status' => 'required|in:active,inactive',
        ];
    }

    // Check if the teacher is active
    public function isActive()
    {
        return $this->status === 'active';
    }

    public function sections()
    {
        return $this->hasMany(TeacherSection::class);
    }

    public function currentSections()
    {
        $currentYear = date('Y') . '-' . (date('Y') + 1);
        return $this->sections()->where('academic_year', $currentYear);
    }

    public function gradeLevels()
    {
        return $this->sections()
            ->where('academic_year', date('Y') . '-' . (date('Y') + 1))
            ->distinct()
            ->pluck('grade_level');
    }

    public function canManageSection($section, $gradeLevel)
    {
        return $this->sections()
            ->where('section', $section)
            ->where('grade_level', $gradeLevel)
            ->where('academic_year', date('Y') . '-' . (date('Y') + 1))
            ->exists();
    }

    public function getSectionsForGradeLevel($gradeLevel)
    {
        return $this->sections()
            ->where('grade_level', $gradeLevel)
            ->where('academic_year', date('Y') . '-' . (date('Y') + 1))
            ->pluck('section');
    }
}