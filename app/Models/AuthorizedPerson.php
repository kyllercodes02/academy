<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuthorizedPerson extends Model
{
    use HasFactory;

    protected $table = 'authorized_persons';

    protected $fillable = [
        'student_id',
        'name',
        'relationship',
        'contact_number',
        'email',
        'address',
        'id_type',
        'id_number',
        'is_primary',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get the student that owns the authorized person.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Scope a query to only include active authorized persons.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include primary authorized persons.
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    /**
     * Get the primary authorized person for a student.
     */
    public static function getPrimaryForStudent($studentId)
    {
        return self::where('student_id', $studentId)
            ->where('is_primary', true)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get all active authorized persons for a student.
     */
    public static function getActiveForStudent($studentId)
    {
        return self::where('student_id', $studentId)
            ->where('is_active', true)
            ->orderBy('is_primary', 'desc')
            ->orderBy('name')
            ->get();
    }
}
