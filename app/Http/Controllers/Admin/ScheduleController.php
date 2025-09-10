<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Section;
use App\Events\ScheduleCreated;
use App\Events\ScheduleUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Display the schedule management page.
     */
    public function index()
    {
        $sections = Section::with('gradeLevel')->orderBy('name')->get();
        $gradeLevels = \App\Models\GradeLevel::orderBy('level')->get();
        
        return Inertia::render('Admin/Schedules/Index', [
            'sections' => $sections,
            'gradeLevels' => $gradeLevels,
        ]);
    }

    /**
     * Get schedules for a specific section.
     */
    public function getSchedules(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
        ]);

        $section = Section::with('gradeLevel')->findOrFail($request->section_id);
        $schedules = Schedule::getSchedulesByDay($request->section_id);

        return response()->json([
            'section' => $section,
            'schedules' => $schedules,
        ]);
    }

    /**
     * Store a new schedule.
     */
    public function store(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'subject' => 'required|string|max:255',
            'teacher_name' => 'required|string|max:255',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Check for time conflicts
        if (Schedule::hasTimeConflict(
            $request->section_id,
            $request->day,
            $request->start_time,
            $request->end_time
        )) {
            return response()->json([
                'message' => 'There is a time conflict with an existing schedule for this section on the same day.',
            ], 422);
        }

        $schedule = Schedule::create($request->all());

        // Dispatch event for real-time updates
        event(new ScheduleCreated($schedule));

        return response()->json([
            'message' => 'Schedule created successfully.',
            'schedule' => $schedule,
        ]);
    }

    /**
     * Update an existing schedule.
     */
    public function update(Request $request, Schedule $schedule)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'teacher_name' => 'required|string|max:255',
            'day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Check for time conflicts (excluding current schedule)
        if (Schedule::hasTimeConflict(
            $schedule->section_id,
            $request->day,
            $request->start_time,
            $request->end_time,
            $schedule->id
        )) {
            return response()->json([
                'message' => 'There is a time conflict with an existing schedule for this section on the same day.',
            ], 422);
        }

        $schedule->update($request->all());

        // Dispatch event for real-time updates
        event(new ScheduleUpdated($schedule));

        return response()->json([
            'message' => 'Schedule updated successfully.',
            'schedule' => $schedule,
        ]);
    }

    /**
     * Delete a schedule.
     */
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        return response()->json([
            'message' => 'Schedule deleted successfully.',
        ]);
    }

    /**
     * Bulk create schedules for a section.
     */
    public function bulkStore(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'schedules' => 'required|array|min:1',
            'schedules.*.subject' => 'required|string|max:255',
            'schedules.*.teacher_name' => 'required|string|max:255',
            'schedules.*.day' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i',
            'schedules.*.room' => 'nullable|string|max:255',
            'schedules.*.description' => 'nullable|string',
        ]);

        // Validate for time conflicts
        foreach ($request->schedules as $schedule) {
            if (Schedule::hasTimeConflict(
                $request->section_id,
                $schedule['day'],
                $schedule['start_time'],
                $schedule['end_time']
            )) {
                return response()->json([
                    'message' => "Time conflict found for {$schedule['day']} at {$schedule['start_time']} - {$schedule['end_time']}",
                ], 422);
            }
        }

        $schedules = Schedule::bulkCreateForSection($request->section_id, $request->schedules);

        // Dispatch events for each created schedule
        foreach ($schedules as $schedule) {
            event(new ScheduleCreated($schedule));
        }

        return response()->json([
            'message' => 'Schedules created successfully.',
            'schedules' => $schedules,
        ]);
    }

    /**
     * Clear all schedules for a section.
     */
    public function clearSection(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
        ]);

        Schedule::clearSectionSchedules($request->section_id);

        return response()->json([
            'message' => 'All schedules for this section have been cleared.',
        ]);
    }

    /**
     * Upload CSV file with schedules.
     */
    public function uploadCSV(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'csv_file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('csv_file');
        $csvData = [];

        if (($handle = fopen($file->getPathname(), "r")) !== FALSE) {
            // Skip header row
            fgetcsv($handle);
            
            while (($data = fgetcsv($handle)) !== FALSE) {
                if (count($data) >= 4) { // At least day, subject, start_time, end_time
                    $csvData[] = [
                        'day' => trim($data[0]),
                        'subject' => trim($data[1]),
                        'start_time' => trim($data[2]),
                        'end_time' => trim($data[3]),
                        'teacher_name' => isset($data[4]) ? trim($data[4]) : '',
                        'room' => isset($data[5]) ? trim($data[5]) : '',
                        'description' => isset($data[6]) ? trim($data[6]) : '',
                    ];
                }
            }
            fclose($handle);
        }

        if (empty($csvData)) {
            return response()->json([
                'message' => 'No valid data found in the CSV file.',
            ], 422);
        }

        // Validate CSV data
        foreach ($csvData as $row) {
            if (!in_array($row['day'], ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])) {
                return response()->json([
                    'message' => "Invalid day: {$row['day']}. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday",
                ], 422);
            }
        }

        Schedule::importFromCSV($request->section_id, $csvData);

        return response()->json([
            'message' => 'Schedules imported successfully from CSV.',
        ]);
    }

    /**
     * Export schedules for a section as CSV.
     */
    public function exportCSV(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
        ]);

        $section = Section::with('gradeLevel')->findOrFail($request->section_id);
        $schedules = Schedule::getSchedulesForSection($request->section_id);

        $filename = "schedule_{$section->name}_" . date('Y-m-d') . ".csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($schedules) {
            $file = fopen('php://output', 'w');
            
            // Header row
            fputcsv($file, ['Day', 'Subject', 'Start Time', 'End Time', 'Teacher', 'Room', 'Description']);
            
            // Data rows
            foreach ($schedules as $schedule) {
                fputcsv($file, [
                    $schedule->day,
                    $schedule->subject,
                    $schedule->start_time->format('H:i'),
                    $schedule->end_time->format('H:i'),
                    $schedule->teacher_name,
                    $schedule->room,
                    $schedule->description,
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
} 