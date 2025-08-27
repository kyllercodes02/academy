<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class GuardianStudent extends Pivot
{
    protected $table = 'guardian_student';

    protected $fillable = [
        'guardian_id',
        'student_id',
        'is_primary_guardian',
        'can_pickup'
    ];

    protected $casts = [
        'is_primary_guardian' => 'boolean',
        'can_pickup' => 'boolean'
    ];
} 