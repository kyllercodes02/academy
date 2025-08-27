<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendances';

    protected $fillable = [
        'student_id',
        'date',
        'status',
        'check_in_time',
        'check_out_time',
        'remarks'
    ];

    protected $casts = [
        'date' => 'date',
        'check_in_time' => 'string',
        'check_out_time' => 'string'
    ];

    protected $appends = [
        'formatted_check_in_time',
        'formatted_check_out_time'
    ];

    /**
     * Get the student that owns the attendance record.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the formatted check-in time.
     */
    public function getFormattedCheckInTimeAttribute()
    {
        return $this->check_in_time ? Carbon::createFromFormat('H:i:s', $this->check_in_time)->format('g:i A') : null;
    }

    /**
     * Get the formatted check-out time.
     */
    public function getFormattedCheckOutTimeAttribute()
    {
        return $this->check_out_time ? Carbon::createFromFormat('H:i:s', $this->check_out_time)->format('g:i A') : null;
    }
} 