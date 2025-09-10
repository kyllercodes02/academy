<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\TeacherAssignment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of the students assigned to the teacher.
     */
    public function index(): Response
    {
        $teacher = auth()->user();
        
        // Get the teacher's assigned sections using TeacherAssignment
        $teacherAssignments = TeacherAssignment::where('user_id', $teacher->id)->get();

        if ($teacherAssignments->isEmpty()) {
            return Inertia::render('Teacher/Students/Index', [
                'students' => [],
            ]);
        }

        // Get students from the teacher's sections
        $students = Student::whereIn('section_id', $teacherAssignments->pluck('section_id'))
            ->with(['section', 'guardian'])
            ->get();

        return Inertia::render('Teacher/Students/Index', [
            'students' => $students,
        ]);
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student): Response
    {
        $teacher = auth()->user();
        
        // Check if teacher has access to this student's section
        $hasAccess = TeacherAssignment::where('user_id', $teacher->id)
            ->where('section_id', $student->section_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to this student.');
        }

        $student->load(['section', 'guardian', 'attendances']);

        return Inertia::render('Teacher/Students/Show', [
            'student' => $student,
        ]);
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(Student $student): Response
    {
        $teacher = auth()->user();
        
        // Check if teacher has access to this student's section
        $hasAccess = TeacherAssignment::where('user_id', $teacher->id)
            ->where('section_id', $student->section_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to this student.');
        }

        return Inertia::render('Teacher/Students/Edit', [
            'student' => $student,
        ]);
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, Student $student): Response
    {
        $teacher = auth()->user();
        
        // Check if teacher has access to this student's section
        $hasAccess = TeacherAssignment::where('user_id', $teacher->id)
            ->where('section_id', $student->section_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to this student.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:students,email,' . $student->id,
            'phone' => 'nullable|string|max:15',
        ]);

        $student->update($validated);

        return redirect()->route('teacher.students.show', $student);
    }
} 