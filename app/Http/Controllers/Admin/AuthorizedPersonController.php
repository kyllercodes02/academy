<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\AuthorizedPerson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthorizedPersonController extends Controller
{
    /**
     * Display a listing of authorized persons for a student.
     */
    public function index(Request $request)
    {
        $studentId = $request->input('student_id');
        
        if (!$studentId) {
            return response()->json([
                'success' => false,
                'message' => 'Student ID is required'
            ], 400);
        }

        $student = Student::findOrFail($studentId);
        $authorizedPersons = $student->authorizedPersons()->orderBy('is_primary', 'desc')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'student' => $student,
                'authorized_persons' => $authorizedPersons
            ]
        ]);
    }

    /**
     * Store a newly created authorized person.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'name' => 'required|string|max:255',
            'relationship' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'id_type' => 'nullable|string|max:100',
            'id_number' => 'nullable|string|max:100',
            'is_primary' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // If this is being set as primary, unset other primary authorized persons
        if ($request->is_primary) {
            AuthorizedPerson::where('student_id', $request->student_id)
                ->where('is_primary', true)
                ->update(['is_primary' => false]);
        }

        $authorizedPerson = AuthorizedPerson::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Authorized person created successfully',
            'data' => $authorizedPerson
        ], 201);
    }

    /**
     * Display the specified authorized person.
     */
    public function show($id)
    {
        $authorizedPerson = AuthorizedPerson::with('student')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $authorizedPerson
        ]);
    }

    /**
     * Update the specified authorized person.
     */
    public function update(Request $request, $id)
    {
        $authorizedPerson = AuthorizedPerson::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'relationship' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'id_type' => 'nullable|string|max:100',
            'id_number' => 'nullable|string|max:100',
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // If this is being set as primary, unset other primary authorized persons
        if ($request->is_primary && !$authorizedPerson->is_primary) {
            AuthorizedPerson::where('student_id', $authorizedPerson->student_id)
                ->where('is_primary', true)
                ->where('id', '!=', $id)
                ->update(['is_primary' => false]);
        }

        $authorizedPerson->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Authorized person updated successfully',
            'data' => $authorizedPerson
        ]);
    }

    /**
     * Remove the specified authorized person.
     */
    public function destroy($id)
    {
        $authorizedPerson = AuthorizedPerson::findOrFail($id);
        $authorizedPerson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Authorized person deleted successfully'
        ]);
    }

    /**
     * Set a specific authorized person as primary.
     */
    public function setPrimary($id)
    {
        $authorizedPerson = AuthorizedPerson::findOrFail($id);

        // Unset other primary authorized persons for this student
        AuthorizedPerson::where('student_id', $authorizedPerson->student_id)
            ->where('is_primary', true)
            ->update(['is_primary' => false]);

        // Set this one as primary
        $authorizedPerson->update(['is_primary' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Primary authorized person updated successfully',
            'data' => $authorizedPerson
        ]);
    }
}
