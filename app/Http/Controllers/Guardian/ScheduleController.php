<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Display the schedule for the guardian's child's section.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get the guardian's children and their sections
        $children = $user->students()->with('section.gradeLevel')->get();
        
        if ($children->isEmpty()) {
            return Inertia::render('Guardian/Schedules/Index', [
                'children' => [],
                'schedules' => [],
                'message' => 'No children found in your account.',
            ]);
        }

        $schedules = [];
        foreach ($children as $child) {
            if ($child->section) {
                $schedules[$child->id] = [
                    'child' => $child,
                    'schedules' => Schedule::getSchedulesByDay($child->section->id),
                ];
            }
        }

        return Inertia::render('Guardian/Schedules/Index', [
            'children' => $children,
            'schedules' => $schedules,
        ]);
    }

    /**
     * Get schedules for a specific child's section.
     */
    public function getChildSchedule(Request $request, $childId)
    {
        $user = $request->user();
        
        // Verify the child belongs to this guardian
        $child = $user->students()->with('section.gradeLevel')->findOrFail($childId);
        
        if (!$child->section) {
            return response()->json([
                'message' => 'No section assigned to this child.',
            ], 404);
        }

        $schedules = Schedule::getSchedulesByDay($child->section->id);

        return response()->json([
            'child' => $child,
            'schedules' => $schedules,
        ]);
    }
} 