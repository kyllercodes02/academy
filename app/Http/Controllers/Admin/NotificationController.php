<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        // Ensure we use the admin guard consistently
        $user = Auth::guard('admin')->user();
        $notifications = $user->notifications()->latest()->limit(20)->get();

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function fetch()
    {
        $user = Auth::guard('admin')->user();
        return response()->json([
            'notifications' => $user->notifications()->latest()->limit(20)->get(),
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(Request $request, string $id)
    {
        $user = Auth::guard('admin')->user();
        $notification = $user->notifications()->where('id', $id)->firstOrFail();
        if (is_null($notification->read_at)) {
            $notification->markAsRead();
        }
        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
    {
        $user = Auth::guard('admin')->user();
        $user->unreadNotifications->markAsRead();
        return response()->json(['success' => true]);
    }
}


