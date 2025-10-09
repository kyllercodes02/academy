<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\TeacherAssignment;
use App\Models\Section;
use App\Models\GradeLevel;
use App\Models\Guardian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of the students assigned to the teacher.
     */
    public function index(Request $request): Response
    {
        $teacher = auth()->user();
        
        // Get the teacher's assigned sections using TeacherAssignment
        $teacherAssignments = TeacherAssignment::where('user_id', $teacher->id)->get();

        if ($teacherAssignments->isEmpty()) {
            return Inertia::render('Teacher/Students/Index', [
                'students' => [],
                'sections' => [],
                'gradeLevels' => [],
                'guardians' => [],
                'search' => $request->search,
            ]);
        }

        $query = Student::with(['section', 'gradeLevel', 'guardians'])
            ->whereIn('section_id', $teacherAssignments->pluck('section_id'));

        // Search functionality
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('lrn', 'like', "%{$searchTerm}%")
                  ->orWhere('id', 'like', "%{$searchTerm}%")
                  ->orWhere('card_id', 'like', "%{$searchTerm}%");
            });
        }

        $students = $query->paginate(15)->appends($request->only(['search']));
        
        // Add guardian_emails for each student
        $students->getCollection()->transform(function ($student) {
            $student->guardian_emails = $student->guardians->map(function($g) {
                return $g->email ?? null;
            })->filter()->implode(', ');
            return $student;
        });

        // Get available sections and grade levels for the teacher
        $availableSections = Section::whereIn('id', $teacherAssignments->pluck('section_id'))
            ->with('gradeLevel')
            ->get();
        
        $availableGradeLevels = GradeLevel::whereIn('id', $teacherAssignments->pluck('grade_level_id'))
            ->get();

        // Get guardians for selection
        $guardians = Guardian::with('user')->get();

        return Inertia::render('Teacher/Students/Index', [
            'students' => $students,
            'sections' => $availableSections,
            'gradeLevels' => $availableGradeLevels,
            'guardians' => $guardians,
            'search' => $request->search,
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request)
    {
        $teacher = auth()->user();
        
        // Get teacher's assigned sections
        $teacherAssignments = TeacherAssignment::where('user_id', $teacher->id)->get();
        $availableSectionIds = $teacherAssignments->pluck('section_id')->toArray();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lrn' => 'nullable|string|max:12|unique:students,lrn',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'section_id' => ['required', 'exists:sections,id', Rule::in($availableSectionIds)],
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

            return redirect()->route('teacher.students.index')
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

        $student->load(['section', 'gradeLevel', 'guardians', 'attendances']);

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
    public function update(Request $request, Student $student)
    {
        $teacher = auth()->user();
        
        // Check if teacher has access to this student's section
        $hasAccess = TeacherAssignment::where('user_id', $teacher->id)
            ->where('section_id', $student->section_id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You do not have access to this student.');
        }

        // Get teacher's assigned sections
        $teacherAssignments = TeacherAssignment::where('user_id', $teacher->id)->get();
        $availableSectionIds = $teacherAssignments->pluck('section_id')->toArray();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'lrn' => 'nullable|string|max:12|unique:students,lrn,' . $student->id,
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'section_id' => ['required', 'exists:sections,id', Rule::in($availableSectionIds)],
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

            // Sync guardians
            if ($request->has('guardian_ids') && is_array($request->guardian_ids)) {
                $student->guardians()->sync($request->guardian_ids);
            }

            DB::commit();

            return redirect()->route('teacher.students.index')
                ->with('success', 'Student updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Student update failed: ' . $e->getMessage());
            return back()
                ->withErrors(['error' => 'Failed to update student: ' . $e->getMessage()])
                ->withInput();
        }
    }
} 