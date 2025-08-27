<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Guardian extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $guard = 'guardian';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'relationship',
        'contact_number',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'remember_token',
    ];

    /**
     * Get the user associated with the guardian.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the email for the guardian.
     */
    public function getEmailAttribute()
    {
        return $this->user->email;
    }

    /**
     * Get the password for the guardian.
     */
    public function getAuthPassword()
    {
        return $this->user->password;
    }

    /**
     * Get the name for the guardian.
     */
    public function getNameAttribute()
    {
        return $this->user->name;
    }

    /**
     * Get the role for the guardian.
     */
    public function getRoleAttribute()
    {
        return 'guardian';
    }

    /**
     * Get the students associated with the guardian.
     */
    public function getStudentsAttribute()
    {
        return $this->user->students;
    }

    /**
     * Get the students associated with the guardian through the user relationship.
     */
    public function students()
    {
        return $this->user->students();
    }

    /**
     * Find a guardian by email through the user relationship
     */
    public static function findByEmail($email)
    {
        return static::whereHas('user', function ($query) use ($email) {
            $query->where('email', $email);
        })->first();
    }
}
