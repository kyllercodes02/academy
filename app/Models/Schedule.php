<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_id',
        'subject',
        'teacher_name',
        'day',
        'start_time',
        'end_time',
        'room',
        'description',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    /**
     * Get the section that owns the schedule.
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * Get schedules for a specific section.
     */
    public static function getSchedulesForSection($sectionId)
    {
        return self::where('section_id', $sectionId)
            ->orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Get schedules grouped by day for a section.
     */
    public static function getSchedulesByDay($sectionId)
    {
        $schedules = self::getSchedulesForSection($sectionId);
        
        $grouped = [];
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        foreach ($days as $day) {
            $grouped[$day] = $schedules->where('day', $day)->sortBy('start_time');
        }
        
        return $grouped;
    }

    /**
     * Check if there's a time conflict for a section on a specific day.
     */
    public static function hasTimeConflict($sectionId, $day, $startTime, $endTime, $excludeId = null)
    {
        $query = self::where('section_id', $sectionId)
            ->where('day', $day)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($q2) use ($startTime, $endTime) {
                      $q2->where('start_time', '<=', $startTime)
                         ->where('end_time', '>=', $endTime);
                  });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Clear all schedules for a section.
     */
    public static function clearSectionSchedules($sectionId)
    {
        return self::where('section_id', $sectionId)->delete();
    }

    /**
     * Bulk create schedules for a section.
     */
    public static function bulkCreateForSection($sectionId, $schedules)
    {
        // Clear existing schedules for the section
        self::clearSectionSchedules($sectionId);
        
        // Create new schedules
        $createdSchedules = [];
        foreach ($schedules as $schedule) {
            $schedule['section_id'] = $sectionId;
            $createdSchedules[] = self::create($schedule);
        }
        
        return $createdSchedules;
    }

    /**
     * Import schedules from CSV data for a section.
     */
    public static function importFromCSV($sectionId, $csvData)
    {
        // Clear existing schedules
        self::clearSectionSchedules($sectionId);
        
        $schedules = [];
        foreach ($csvData as $row) {
            if (!empty($row['day']) && !empty($row['subject']) && !empty($row['start_time']) && !empty($row['end_time'])) {
                $schedules[] = [
                    'section_id' => $sectionId,
                    'subject' => $row['subject'],
                    'teacher_name' => $row['teacher_name'] ?? '',
                    'day' => $row['day'],
                    'start_time' => $row['start_time'],
                    'end_time' => $row['end_time'],
                    'room' => $row['room'] ?? '',
                    'description' => $row['description'] ?? '',
                ];
            }
        }
        
        return self::insert($schedules);
    }
} 