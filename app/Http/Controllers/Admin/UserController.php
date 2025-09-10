<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Only show Admin accounts in this section
        $users = User::query()
            ->where('role', 'admin')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('role', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'search' => $search,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Force Admin-only creation from this section
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            // Ensure this management section keeps users as Admins only
            'role' => 'admin',
        ];

        if ($request->filled('password')) {
            $request->validate([
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    /**
     * Fetch the latest notifications for the authenticated admin.
     */
    public function fetchNotifications(Request $request)
    {
        $admin = auth('admin')->user();
        if (!$admin) {
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ], 401);
        }
        $notifications = $admin->notifications()->latest()->take(20)->get();
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $notifications->whereNull('read_at')->count(),
        ]);
    }

    /**
     * Mark all notifications as read for the authenticated admin.
     */
    public function markNotificationsAsRead(Request $request)
    {
        $admin = auth('admin')->user();
        if (!$admin) {
            return response()->json(['success' => false], 401);
        }
        
        $admin->unreadNotifications->markAsRead();
        
        return response()->json(['success' => true]);
    }
} 