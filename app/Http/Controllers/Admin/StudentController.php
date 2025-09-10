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

        // Section filter
        if ($request->filled('section')) {
            $query->where('section_id', $request->input('section'));
        }

        // Grade level filter
        if ($request->filled('grade')) {
            $query->where('grade_level_id', $request->input('grade'));
        }

        $students = $query->paginate(15)->appends($request->only(['search', 'section', 'grade']));
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
            'sections' => Section::with('gradeLevel')->get(),
            'gradeLevels' => GradeLevel::all(),
            'guardians' => $guardians,
            'search' => $request->search,
            'sectionFilter' => $request->input('section', ''),
            'gradeFilter' => $request->input('grade', '')
        ]);
    }

    /**
     * Display the specified student (JSON response).
     */
    public function show(Student $student)
    {
        try {
            $student->load(['section', 'gradeLevel', 'guardians']);
            // Include guardian emails for parity with index listing
            $student->guardian_emails = $student->guardians->map(function($g) {
                return $g->email ?? null;
            })->filter()->implode(', ');

            return response()->json([
                'success' => true,
                'student' => $student,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Failed to load student: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to load student',
            ], 500);
        }
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
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('csv_file');

        $expectedHeaders = [
            'name',
            'lrn',
            'date_of_birth',
            'gender',
            'section_id',
            'grade_level_id',
            'guardian_ids', // comma-separated user ids (optional)
            'guardian_emails', // comma-separated emails (optional alternative)
            'card_id' // optional
        ];

        $handle = fopen($file->getPathname(), 'r');
        if ($handle === false) {
            return response()->json(['message' => 'Unable to read uploaded file.'], 400);
        }

        $header = fgetcsv($handle);
        if (!$header) {
            fclose($handle);
            return response()->json(['message' => 'CSV is empty or invalid.'], 422);
        }

        // Normalize headers
        $normalizedHeader = array_map(function ($h) {
            return strtolower(trim($h));
        }, $header);

        // Ensure required headers exist (match manual add)
        $required = ['name', 'section_id', 'grade_level_id'];
        foreach ($required as $req) {
            if (!in_array($req, $normalizedHeader, true)) {
                fclose($handle);
                return response()->json([
                    'message' => "Missing required header: {$req}.",
                    'expected_headers' => $expectedHeaders,
                ], 422);
            }
        }

        $rows = [];
        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) === 1 && trim($data[0]) === '') {
                continue; // skip empty line
            }
            $row = [];
            foreach ($normalizedHeader as $index => $key) {
                $row[$key] = isset($data[$index]) ? trim($data[$index]) : null;
            }
            $rows[] = $row;
        }
        fclose($handle);

        if (count($rows) === 0) {
            return response()->json(['message' => 'No data rows found in CSV.'], 422);
        }

        $created = 0;
        $updated = 0;
        $errors = [];
        $processedIds = [];

        foreach ($rows as $lineNumber => $row) {
            // Build per-row validator using manual creation rules
            $validator = Validator::make($row, [
                'name' => 'required|string|max:255',
                'lrn' => 'nullable|string|max:12', // checked for uniqueness below depending on existing
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female',
                'section_id' => 'required|exists:sections,id',
                'grade_level_id' => 'required|exists:grade_levels,id',
                'guardian_ids' => 'nullable|string',
                'guardian_emails' => 'nullable|string',
                'card_id' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                $errors[] = [
                    'row' => $lineNumber + 2, // +2 accounts for header row and 0-index
                    'data' => $row,
                    'messages' => $validator->errors()->all(),
                ];
                continue;
            }

            try {
                DB::beginTransaction();

                // Upsert target: prefer LRN, else card_id, else name+section+grade
                $studentQuery = Student::query();
                if (!empty($row['lrn'])) {
                    $studentQuery->where('lrn', $row['lrn']);
                } elseif (!empty($row['card_id'])) {
                    $studentQuery->where('card_id', $row['card_id']);
                } else {
                    $studentQuery->where('name', $row['name'])
                        ->where('section_id', $row['section_id'])
                        ->where('grade_level_id', $row['grade_level_id']);
                }

                $student = $studentQuery->first();

                $payload = [
                    'name' => $row['name'],
                    'lrn' => $row['lrn'] ?? null,
                    'date_of_birth' => $row['date_of_birth'] ?: null,
                    'gender' => $row['gender'] ?: null,
                    'section_id' => (int)$row['section_id'],
                    'grade_level_id' => (int)$row['grade_level_id'],
                ];

                if (!empty($row['card_id'])) {
                    // Ensure card_id uniqueness when assigning/ updating
                    $cardOwner = Student::where('card_id', $row['card_id'])
                        ->when($student, function($q) use ($student) { $q->where('id', '!=', $student->id); })
                        ->first();
                    if ($cardOwner) {
                        throw new \Exception('card_id already used by another student');
                    }
                    $payload['card_id'] = $row['card_id'];
                }

                if ($student) {
                    // If LRN changes, ensure uniqueness
                    if (!empty($payload['lrn'])) {
                        $lrnOwner = Student::where('lrn', $payload['lrn'])
                            ->where('id', '!=', $student->id)
                            ->first();
                        if ($lrnOwner) {
                            throw new \Exception('lrn already exists');
                        }
                    }
                    $student->update($payload);
                    $updated++;
                } else {
                    // If creating with LRN, ensure unique
                    if (!empty($payload['lrn'])) {
                        $exists = Student::where('lrn', $payload['lrn'])->exists();
                        if ($exists) {
                            throw new \Exception('lrn already exists');
                        }
                    }
                    $student = Student::create(array_merge($payload, ['status' => 'active']));
                    $created++;
                }

                // Guardians attach via ids or emails
                $guardianUserIds = [];
                if (!empty($row['guardian_ids'])) {
                    $guardianUserIds = collect(explode(',', $row['guardian_ids']))
                        ->map(function ($id) { return (int)trim($id); })
                        ->filter()
                        ->values()
                        ->all();
                } elseif (!empty($row['guardian_emails'])) {
                    $emails = collect(explode(',', $row['guardian_emails']))
                        ->map(function ($e) { return strtolower(trim($e)); })
                        ->filter()
                        ->values();
                    if ($emails->isNotEmpty()) {
                        $guardianUserIds = \App\Models\User::whereIn('email', $emails)
                            ->where('role', 'guardian')
                            ->pluck('id')
                            ->all();
                    }
                }
                if (!empty($guardianUserIds)) {
                    $student->guardians()->sync($guardianUserIds);
                }

                DB::commit();
                $processedIds[] = $student->id;
            } catch (\Throwable $e) {
                DB::rollBack();
                $errors[] = [
                    'row' => $lineNumber + 2,
                    'data' => $row,
                    'messages' => [$e->getMessage()],
                ];
            }
        }

        return response()->json([
            'message' => 'CSV processed',
            'created' => $created,
            'updated' => $updated,
            'errors' => $errors,
            'processed_ids' => $processedIds,
        ]);
    }

    /**
     * Download a CSV template with correct headers for student import.
     */
    public function downloadCsvTemplate()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="student_import_template.csv"',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ];

        $callback = function () {
            $output = fopen('php://output', 'w');
            fputcsv($output, [
                'name',
                'lrn',
                'date_of_birth',
                'gender',
                'section_id',
                'grade_level_id',
                'guardian_emails',
                'card_id'
            ]);
            // Example row
            fputcsv($output, [
                'Juan Dela Cruz',
                '123456789012',
                '2012-05-01',
                'male',
                '1',
                '1',
                'parent1@example.com,parent2@example.com',
                ''
            ]);
            fclose($output);
        };

        return response()->streamDownload($callback, 'student_import_template.csv', $headers);
    }
}