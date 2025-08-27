<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StudentController extends Controller
{
    /**
     * Look up a student by their card number.
     */
    public function lookupByCard(Request $request): JsonResponse
    {
        $request->validate([
            'card_number' => 'required|string',
        ]);

        $student = Student::where('card_number', $request->card_number)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found with this card number.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'section' => $student->section ? $student->section->name : null,
                'grade_level' => $student->section ? $student->section->gradeLevel->name : null,
                'photo' => $student->photo ? asset('storage/' . $student->photo) : null,
            ],
        ]);
    }
} 