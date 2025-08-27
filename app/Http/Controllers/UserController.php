<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Section;
use App\Models\GuardianDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['guardianDetails', 'sections', 'students'])
            ->orderBy('name')
            ->paginate(10);

        return view('users.index', compact('users'));
    }

    public function create()
    {
        $sections = Section::pluck('name');
        $students = Student::orderBy('name')->get();
        
        return view('users.create', compact('sections', 'students'));
    }

    public function store(Request $request)
    {
        $this->validateUser($request, true);

        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            $this->handleRoleSpecificData($user, $request);
        });

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        $sections = Section::pluck('name');
        $students = Student::orderBy('name')->get();
        $assignedSections = $user->sections->pluck('name')->toArray();
        $linkedStudents = $user->students->pluck('id')->toArray();
        $guardianDetails = $user->guardianDetails;
        $primaryStudents = $user->students()
            ->wherePivot('is_primary_guardian', true)
            ->pluck('student_id')
            ->toArray();
        $canPickupStudents = $user->students()
            ->wherePivot('can_pickup', true)
            ->pluck('student_id')
            ->toArray();

        return view('users.edit', compact(
            'user',
            'sections',
            'students',
            'assignedSections',
            'linkedStudents',
            'guardianDetails',
            'primaryStudents',
            'canPickupStudents'
        ));
    }

    public function update(Request $request, User $user)
    {
        $this->validateUser($request, false, $user);

        DB::transaction(function () use ($request, $user) {
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);

            $this->handleRoleSpecificData($user, $request);
        });

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    protected function validateUser(Request $request, bool $isCreating = true, ?User $user = null)
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                $isCreating
                    ? 'unique:users'
                    : 'unique:users,email,' . $user->id,
            ],
            'role' => ['required', 'in:admin,teacher,guardian'],
        ];

        if ($isCreating || $request->filled('password')) {
            $rules['password'] = ['required', 'confirmed', Rules\Password::defaults()];
        }

        if ($request->role === 'teacher') {
            $rules['sections'] = ['required', 'array', 'min:1'];
            $rules['sections.*'] = ['exists:sections,name'];
        }

        if ($request->role === 'guardian') {
            $rules = array_merge($rules, [
                'contact_number' => ['required', 'string', 'max:20'],
                'relationship' => ['required', 'in:parent,guardian,other'],
                'address' => ['nullable', 'string', 'max:500'],
                'emergency_contact_name' => ['nullable', 'string', 'max:255'],
                'emergency_contact_number' => ['nullable', 'string', 'max:20'],
                'students' => ['required', 'array', 'min:1'],
                'students.*' => ['exists:students,id'],
                'primary_guardian' => ['array'],
                'primary_guardian.*' => ['boolean'],
                'can_pickup' => ['array'],
                'can_pickup.*' => ['boolean'],
            ]);
        }

        $request->validate($rules);
    }

    protected function handleRoleSpecificData(User $user, Request $request)
    {
        if ($user->role === 'teacher') {
            $user->sections()->sync($request->sections);
        } elseif ($user->role === 'guardian') {
            // Update or create guardian details
            $user->guardianDetails()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'contact_number' => $request->contact_number,
                    'relationship' => $request->relationship,
                    'address' => $request->address,
                    'emergency_contact_name' => $request->emergency_contact_name,
                    'emergency_contact_number' => $request->emergency_contact_number,
                ]
            );

            // Sync students with pivot data
            $studentSync = [];
            foreach ($request->students as $studentId) {
                $studentSync[$studentId] = [
                    'is_primary_guardian' => isset($request->primary_guardian[$studentId]),
                    'can_pickup' => isset($request->can_pickup[$studentId]),
                ];
            }
            $user->students()->sync($studentSync);
        }
    }
} 