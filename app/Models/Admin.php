<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Admin extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $guard = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if admin has access to a specific section.
     * Admins have access to all sections.
     */
    public function hasAccessToSection($section)
    {
        return true;
    }

    /**
     * Check if admin can manage a specific section.
     * Admins can manage all sections.
     */
    public function canManageSection($section)
    {
        return true;
    }

    /**
     * Get all sections (admins can access all sections)
     */
    public function teacherSections()
    {
        return Student::distinct('student_section')->pluck('student_section');
    }
}