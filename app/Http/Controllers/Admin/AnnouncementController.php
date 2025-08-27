<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Events\NewAnnouncementCreated;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with(['admin:id,name'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high',
            'publish_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:publish_at',
        ]);

        $user = Auth::user();
        
        if (!$user || $user->role !== 'admin') {
            return redirect()->route('login')
                ->with('error', 'Unauthorized access.');
        }
        
        $announcement = Announcement::create([
            ...$validated,
            'admin_id' => $user->id,
            'is_active' => true,
        ]);

        // Load the admin relationship for broadcasting
        $announcement->load('admin:id,name');

        // Broadcast the new announcement
        broadcast(new NewAnnouncementCreated($announcement))->toOthers();

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement created successfully.');
    }

    public function edit(Announcement $announcement)
    {
        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => $announcement
        ]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high',
            'is_active' => 'boolean',
            'publish_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:publish_at',
        ]);

        $announcement->update($validated);

        // Load the admin relationship for broadcasting
        $announcement->load('admin:id,name');

        // Broadcast the updated announcement
        broadcast(new NewAnnouncementCreated($announcement))->toOthers();

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement deleted successfully.');
    }
}
