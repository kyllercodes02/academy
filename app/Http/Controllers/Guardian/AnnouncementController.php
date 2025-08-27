<?php

namespace App\Http\Controllers\Guardian;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the announcements.
     */
    public function index(): Response
    {
        $announcements = Announcement::visible()
            ->with('admin:id,name')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Guardian/Announcements/Index', [
            'announcements' => $announcements,
            'user' => Auth::user()
        ]);
    }

    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement): Response
    {
        // Ensure the announcement is active and visible
        if (!$announcement->is_active || !$announcement->is_published || $announcement->is_expired) {
            abort(404);
        }

        return Inertia::render('Guardian/Announcements/Show', [
            'announcement' => $announcement->load('admin:id,name'),
            'user' => Auth::user()
        ]);
    }
}
