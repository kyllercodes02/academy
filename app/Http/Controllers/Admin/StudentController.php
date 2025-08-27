<?php

namespace App\Http\Controllers\Admin;

use App\Models\Student;
use App\Models\Section;
use App\Models\GradeLevel;
use App\Models\Guardian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Imports\StudentImport;
use Maatwebsite\Excel\Facades\Excel;

class StudentController extends Controller
{
    /**
     * Display a listing of students.
     */
    public function index(Request $request)
    {
        $query = Student::with(['section', 'gradeLevel', 'guardians']);

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('card_id', 'like', "%{$searchTerm}%")
                  ->orWhereHas('section', function($q) use ($searchTerm) {
                      $q->where('name', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('gradeLevel', function($q) use ($searchTerm) {
                      $q->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $students = $query->paginate(15);
        // Add guardian_emails for each student
        $students->getCollection()->transform(function ($student) {
            $student->guardian_emails = $student->guardians->map(function($g) {
                return $g->email ?? null;
            })->filter()->implode(', ');
            return $student;
        });

        // Provide guardians as Guardian models with user info
        $guardians = \App\Models\Guardian::with('user')->get();

        return Inertia::render('Admin/StudentManagement', [
            'students' => $students,
            'sections' => Section::all(),
            'gradeLevels' => GradeLevel::all(),
            'guardians' => $guardians,
            'search' => $request->search
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lrn' => 'nullable|string|max:12|unique:students,lrn',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'section_id' => 'required|exists:sections,id',
            'grade_level_id' => 'required|exists:grade_levels,id',
            'guardian_ids' => 'nullable|array',
            'guardian_ids.*' => 'exists:users,id',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $studentData = [
                'name' => $request->name,
                'lrn' => $request->lrn,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'section_id' => $request->section_id,
                'grade_level_id' => $request->grade_level_id,
                'status' => 'active', // Default to active
            ];

            // Handle photo upload
            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                if ($photo->isValid()) {
                    $photoName = time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
                    $photoPath = $photo->storeAs('student_photos', $photoName, 'public');
                    if ($photoPath) {
                        $studentData['photo_url'] = $photoPath;
                    }
                }
            }

            $student = Student::create($studentData);

            // Attach guardians by user_id if provided
            if ($request->has('guardian_ids') && is_array($request->guardian_ids)) {
                $student->guardians()->attach($request->guardian_ids);
            }

            DB::commit();

            return redirect()->route('admin.students.index')
                ->with('success', 'Student created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Student creation failed: ' . $e->getMessage());
            return back()
                ->withErrors(['error' => 'Failed to create student: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, Student $student)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lrn' => 'nullable|string|max:12|unique:students,lrn,' . $student->id,
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'section_id' => 'required|exists:sections,id',
            'grade_level_id' => 'required|exists:grade_levels,id',
            'guardian_ids' => 'nullable|array',
            'guardian_ids.*' => 'exists:users,id',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $studentData = [
                'name' => $request->name,
                'lrn' => $request->lrn,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'section_id' => $request->section_id,
                'grade_level_id' => $request->grade_level_id,
            ];

            // Handle photo upload
            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                if ($photo->isValid()) {
                    if ($student->photo_url && Storage::disk('public')->exists($student->photo_url)) {
                        Storage::disk('public')->delete($student->photo_url);
                    }
                    $photoName = time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
                    $photoPath = $photo->storeAs('student_photos', $photoName, 'public');
                    if ($photoPath) {
                        $studentData['photo_url'] = $photoPath;
                    }
                }
            }

            $student->update($studentData);

            // Sync guardians (convert guardian_ids to user_ids)
            if ($request->has('guardian_ids') && is_array($request->guardian_ids)) {
                $student->guardians()->sync($request->guardian_ids);
            }

            DB::commit();

            return redirect()->route('admin.students.index')
                ->with('success', 'Student updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Student update failed: ' . $e->getMessage());
            return back()
                ->withErrors(['error' => 'Failed to update student: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified student.
     */
    public function destroy(Student $student)
    {
        try {
            DB::beginTransaction();

            // Delete photo if exists
            if ($student->photo_url && Storage::disk('public')->exists($student->photo_url)) {
                Storage::disk('public')->delete($student->photo_url);
            }

            // Detach guardians
            $student->guardians()->detach();

            // Delete student
            $student->delete();

            DB::commit();

            return redirect()->route('admin.students.index')
                ->with('success', 'Student deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Student deletion failed: ' . $e->getMessage());
            
            return back()
                ->withErrors(['error' => 'Failed to delete student: ' . $e->getMessage()]);
        }
    }

    /**
     * Look up a student by their card ID.
     */
    public function lookupByCard(Request $request)
    {
        $request->validate([
            'card_id' => 'required|string',
        ]);

        $cardId = trim($request->input('card_id'));
        
        $student = Student::whereRaw('LOWER(card_id) = ?', [strtolower($cardId)])
            ->where('status', 'active')
            ->with(['section', 'gradeLevel'])
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'student_section' => $student->section->name,
                'grade_level' => $student->gradeLevel->name,
                'card_id' => $student->card_id,
                'photo_url' => $student->photo_url,
            ]
        ]);
    }

    /**
     * Register a card for a student.
     */
    public function registerCard(Request $request, Student $student)
    {
        $validator = Validator::make($request->all(), [
            'card_id' => 'required|string|max:50|unique:students,card_id,' . $student->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $cardId = trim($request->card_id);

            // Check if card is already registered to another student
            $existingStudent = Student::where('card_id', $cardId)
                ->where('id', '!=', $student->id)
                ->first();

            if ($existingStudent) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This card is already registered to another student'
                ], 422);
            }

            $student->card_id = $cardId;
            $student->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Card registered successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Card registration failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to register card'
            ], 500);
        }
    }

    /**
     * Unregister a card from a student.
     */
    public function unregisterCard(Student $student)
    {
        try {
            $student->update(['card_id' => null]);

            return response()->json([
                'status' => 'success',
                'message' => 'Card unregistered successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Card unregistration failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to unregister card'
            ], 500);
        }
    }

    /**
     * Import students from an uploaded Excel or CSV file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv,txt'
        ]);

        try {
            Excel::import(new StudentImport, $request->file('file'));
            return back()->with('success', 'Students imported successfully!');
        } catch (\Exception $e) {
            \Log::error('Student import failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Import failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Import students from a CSV file for a specific section.
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
            $header = fgetcsv($handle);
            while (($data = fgetcsv($handle)) !== FALSE) {
                // Expecting: name, grade_level, status, card_id (optional)
                if (count($data) >= 2) { // At least name, grade_level
                    $csvData[] = [
                        'name' => trim($data[0]),
                        'grade_level' => trim($data[1]),
                        'status' => isset($data[2]) ? strtolower(trim($data[2])) : 'active',
                        'card_id' => isset($data[3]) ? trim($data[3]) : null,
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

        // Validate and import each student
        foreach ($csvData as $row) {
            if (empty($row['name']) || empty($row['grade_level'])) {
                return response()->json([
                    'message' => 'Each row must have at least a name and grade_level.'
                ], 422);
            }
        }

        // Import students into the section
        foreach ($csvData as $row) {
            $gradeLevel = GradeLevel::firstOrCreate(['name' => $row['grade_level']]);
            $student = Student::firstOrNew([
                'name' => $row['name'],
                'section_id' => $request->section_id,
                'grade_level_id' => $gradeLevel->id,
            ]);
            $student->status = $row['status'] ?? 'active';
            if (!empty($row['card_id'])) {
                $student->card_id = $row['card_id'];
            }
            $student->save();
        }

        return response()->json([
            'message' => 'Students imported successfully from CSV.'
        ]);
    }
}