<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Admin;
use App\Notifications\SecurityAlertNotification;

class SecurityAlertController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|integer',
            'name' => 'required|string',
            'grade_level' => 'required|string',
            'student_section' => 'required|string',
            'time' => 'required|date',
        ]);

        // Notify all admins
        $admins = Admin::all();
        foreach ($admins as $admin) {
            $admin->notify(new SecurityAlertNotification($data));
        }

        return response()->json(['message' => 'Alert sent to admin.']);
    }
} 