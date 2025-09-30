<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'lrn',
        'date_of_birth',
        'gender',
        'section_id',
        'grade_level_id',
        'card_id',
        'status',
        'photo_url'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'status' => 'string',
        'date_of_birth' => 'date',
    ];

    protected $appends = ['full_name'];

    /**
     * Scope a query to only include active students.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
   
    /**
     * Scope a query to only include inactive students.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Get the guardian that owns the student.
     */
    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }

    /**
     * Get the section that owns the student.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get the grade level that owns the student.
     */
    public function gradeLevel(): BelongsTo
    {
        return $this->belongsTo(GradeLevel::class);
    }

    /**
     * Get the guardians for the student.
     */
    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_guardians', 'student_id', 'user_id')
            ->where('role', 'guardian');
    }

    /**
     * Get the teacher sections for the student.
     */
    public function teacherSections(): BelongsToMany
    {
        return $this->belongsToMany(TeacherSection::class, 'student_teacher_sections');
    }

    /**
     * Get the student's attendance records.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the student's authorized persons for pickup.
     */
    public function authorizedPersons(): HasMany
    {
        return $this->hasMany(AuthorizedPerson::class);
    }

    /**
     * Get the student's primary authorized person.
     */
    public function primaryAuthorizedPerson(): HasOne
    {
        return $this->hasOne(AuthorizedPerson::class)->where('is_primary', true)->where('is_active', true);
    }

    /**
     * Get today's attendance record.
     */
    public function todayAttendance(): HasOne
    {
        return $this->hasOne(Attendance::class)
            ->whereDate('date', now()->toDateString());
    }

    /**
     * Get the student's full name.
     */
    public function getFullNameAttribute(): string
    {
        return $this->name;
    }

    /**
     * Get the student's photo URL.
     */
    public function getPhotoUrlAttribute($value)
    {
        if (!$value) {
            return null;
        }

        // If the value already contains the full URL, return it
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        // Otherwise, generate the full URL using the storage URL
        return Storage::url($value);
    }

    public function latestAttendance()
    {
        return $this->hasOne(Attendance::class)->latestOfMany();
    }
}