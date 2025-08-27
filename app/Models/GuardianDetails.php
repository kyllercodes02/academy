<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuardianDetails extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'contact_number',
        'relationship',
        'address',
        'emergency_contact_name',
        'emergency_contact_number',
    ];

    /**
     * Get the user that owns the guardian details.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
} 