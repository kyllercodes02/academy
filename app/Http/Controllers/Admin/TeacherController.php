<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Section;
use App\Models\GradeLevel;
use App\Models\TeacherAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function index()
    {
        $teachers = User::where('role', 'teacher')
            ->with(['teacherAssignments.section', 'teacherAssignments.gradeLevel'])
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'teacherAssignments' => $teacher->teacherAssignments->map(function ($assignment) {
                        return [
                            'id' => $assignment->id,
                            'section_id' => $assignment->section_id,
                            'grade_level_id' => $assignment->grade_level_id,
                            'section' => $assignment->section ? [
                                'id' => $assignment->section->id,
                                'name' => $assignment->section->name,
                            ] : null,
                            'gradeLevel' => $assignment->gradeLevel ? [
                                'id' => $assignment->gradeLevel->id,
                                'name' => $assignment->gradeLevel->name,
                            ] : null,
                        ];
                    })->toArray(),
                ];
            });

        $sections = Section::orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($section) {
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                ];
            });

        $gradeLevels = GradeLevel::orderBy('level')
            ->get(['id', 'name'])
            ->map(function ($gradeLevel) {
                return [
                    'id' => $gradeLevel->id,
                    'name' => $gradeLevel->name,
                ];
            });

        return Inertia::render('Admin/TeacherManagement', [
            'teachers' => $teachers,
            'sections' => $sections,
            'gradeLevels' => $gradeLevels,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'section_id' => 'required|exists:sections,id',
            'grade_level_id' => 'required|exists:grade_levels,id',
        ]);

        $teacher = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'teacher',
        ]);

        TeacherAssignment::create([
            'user_id' => $teacher->id,
            'section_id' => $validated['section_id'],
            'grade_level_id' => $validated['grade_level_id'],
        ]);

        return redirect()->back()->with('success', 'Teacher added successfully');
    }

    public function update(Request $request, User $teacher)
    {
        if ($teacher->role !== 'teacher') {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->id,
            'password' => 'nullable|string|min:8',
            'section_id' => 'required|exists:sections,id',
            'grade_level_id' => 'required|exists:grade_levels,id',
        ]);

        $teacher->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($request->filled('password')) {
            $teacher->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        // Update or create teacher assignment
        TeacherAssignment::updateOrCreate(
            ['user_id' => $teacher->id],
            [
                'section_id' => $validated['section_id'],
                'grade_level_id' => $validated['grade_level_id'],
            ]
        );

        return redirect()->back()->with('success', 'Teacher updated successfully');
    }

    public function destroy(User $teacher)
    {
        if ($teacher->role !== 'teacher') {
            abort(404);
        }

        $teacher->delete();

        return redirect()->back()->with('success', 'Teacher deleted successfully');
    }
}