<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Guardian;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class GuardianController extends Controller
{
    /**
     * Display a listing of the guardians.
     */
    public function index()
    {
        $guardians = User::where('role', 'guardian')
            ->with(['guardianDetails', 'students'])
            ->paginate(10);

        return Inertia::render('Admin/Guardians/Index', [
            'guardians' => [
                'data' => $guardians->items(),
                'links' => $guardians->links(),
                'meta' => [
                    'current_page' => $guardians->currentPage(),
                    'from' => $guardians->firstItem(),
                    'last_page' => $guardians->lastPage(),
                    'path' => $guardians->path(),
                    'per_page' => $guardians->perPage(),
                    'to' => $guardians->lastItem(),
                    'total' => $guardians->total(),
                ],
            ],
        ]);
    }

    /**
     * Show the form for creating a new guardian.
     */
    public function create()
    {
        return Inertia::render('Admin/Guardians/Create');
    }

    /**
     * Store a newly created guardian in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'contact_number' => 'required|string|max:20',
            'relationship' => 'required|string|in:parent,guardian,other',
            'address' => 'required|string|max:500',
            'emergency_contact_name' => 'required|string|max:255',
            'emergency_contact_number' => 'required|string|max:20',
        ]);

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'guardian',
            ]);

            Guardian::create([
                'user_id' => $user->id,
                'relationship' => $request->relationship,
                'contact_number' => $request->contact_number,
            ]);

            $user->guardianDetails()->create([
                'contact_number' => $request->contact_number,
                'relationship' => $request->relationship,
                'address' => $request->address,
                'emergency_contact_name' => $request->emergency_contact_name,
                'emergency_contact_number' => $request->emergency_contact_number,
            ]);

            DB::commit();

            return redirect()->route('admin.guardians.index')
                ->with('message', 'Guardian created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Show the form for editing the specified guardian.
     */
    public function edit(User $guardian)
    {
        if ($guardian->role !== 'guardian') {
            abort(404);
        }

        $guardian->load(['guardianDetails']);

        return Inertia::render('Admin/Guardians/Edit', [
            'guardian' => $guardian,
        ]);
    }

    /**
     * Update the specified guardian in storage.
     */
    public function update(Request $request, User $guardian)
    {
        if ($guardian->role !== 'guardian') {
            abort(404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $guardian->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'contact_number' => 'required|string|max:20',
            'relationship' => 'required|string|in:parent,guardian,other',
            'address' => 'required|string|max:500',
            'emergency_contact_name' => 'required|string|max:255',
            'emergency_contact_number' => 'required|string|max:20',
        ]);

        $guardian->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $guardian->update([
                'password' => Hash::make($request->password),
            ]);
        }

        $guardian->guardianDetails()->update([
            'contact_number' => $request->contact_number,
            'relationship' => $request->relationship,
            'address' => $request->address,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_number' => $request->emergency_contact_number,
        ]);

        return redirect()->route('admin.guardians.index')
            ->with('message', 'Guardian updated successfully.');
    }

    /**
     * Remove the specified guardian from storage.
     */
    public function destroy(User $guardian)
    {
        if ($guardian->role !== 'guardian') {
            abort(404);
        }

        // Delete related records
        $guardian->guardianDetails()->delete();
        $guardian->students()->detach();
        $guardian->delete();

        return redirect()->route('admin.guardians.index')
            ->with('message', 'Guardian deleted successfully.');
    }
} 