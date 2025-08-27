<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
    protected $guard = 'web';

    // Define role constants
    const ROLE_ADMIN = 'admin';
    const ROLE_TEACHER = 'teacher';
    const ROLE_GUARDIAN = 'guardian';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
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

    /**
     * Automatically hash the password when setting it
     */
    public function setPasswordAttribute($value)
    {
        if ($value && !Hash::isHashed($value)) {
            $this->attributes['password'] = Hash::make($value);
        } else {
            $this->attributes['password'] = $value;
        }
    }

    /**
     * Check if the user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if the user is a teacher
     */
    public function isTeacher(): bool
    {
        return $this->role === self::ROLE_TEACHER;
    }

    /**
     * Get the sections assigned to the teacher.
     */
    public function teacherSections()
    {
        return $this->hasMany(TeacherSection::class);
    }

    /**
     * Get the guardian profile associated with the user.
     */
    public function guardian()
    {
        return $this->hasOne(Guardian::class);
    }

    /**
     * Check if the user has access to a specific section.
     */
    public function hasAccessToSection($section)
    {
        if ($this->role === self::ROLE_ADMIN) {
            return true;
        }

        if ($this->role === self::ROLE_TEACHER) {
            return $this->teacherSections()->where('section', $section)->exists();
        }

        return false;
    }

    /**
     * Check if the user can manage a specific section.
     */
    public function canManageSection($section)
    {
        return $this->hasAccessToSection($section);
    }

    public function guardianDetails()
    {
        return $this->hasOne(GuardianDetails::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'student_guardians', 'user_id', 'student_id');
    }

    public function sections()
    {
        return $this->belongsToMany(Section::class, 'teacher_sections');
    }

    public function isGuardian()
    {
        return $this->role === self::ROLE_GUARDIAN;
    }

    public function teacherAssignments()
    {
        return $this->hasMany(TeacherAssignment::class);
    }

    /**
     * Check if the user can access a specific student.
     */
    public function canAccessStudent($studentId)
    {
        if ($this->role === self::ROLE_ADMIN) {
            return true;
        }

        if ($this->role === self::ROLE_TEACHER) {
            return $this->sections()
                ->whereHas('students', function ($query) use ($studentId) {
                    $query->where('students.id', $studentId);
                })
                ->exists();
        }

        if ($this->role === self::ROLE_GUARDIAN) {
            return $this->students()->where('students.id', $studentId)->exists();
        }

        return false;
    }
}
