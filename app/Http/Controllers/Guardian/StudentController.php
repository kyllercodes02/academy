<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of the guardian's students.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        return Inertia::render('Guardian/Students/Index', [
            'students' => $user->students()
                ->with(['section', 'gradeLevel'])
                ->get()
        ]);
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student): Response
    {
        $user = Auth::user();
        
        // Check if the guardian has access to this student
        if (!$user->students()->where('students.id', $student->id)->exists()) {
            abort(403, 'Unauthorized access to student information.');
        }

        return Inertia::render('Guardian/Students/Show', [
            'student' => $student->load(['section', 'gradeLevel', 'attendances' => function($query) {
                $query->latest()->take(10);
            }])
        ]);
    }
} 