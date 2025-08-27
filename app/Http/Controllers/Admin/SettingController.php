<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = [
            'school_name' => Setting::get('school_name', 'Zion Academy'),
            'school_address' => Setting::get('school_address', ''),
            'contact_number' => Setting::get('contact_number', ''),
            'email' => Setting::get('email', ''),
            'attendance_start' => Setting::get('attendance_start', '07:00'),
            'attendance_end' => Setting::get('attendance_end', '17:00'),
            'late_threshold' => Setting::get('late_threshold', '08:00'),
            'notification_enabled' => Setting::get('notification_enabled', true),
            'sms_notifications' => Setting::get('sms_notifications', false),
            'email_notifications' => Setting::get('email_notifications', true),
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'school_address' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'attendance_start' => 'required|date_format:H:i',
            'attendance_end' => 'required|date_format:H:i',
            'late_threshold' => 'required|date_format:H:i',
            'notification_enabled' => 'boolean',
            'sms_notifications' => 'boolean',
            'email_notifications' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value, is_bool($value) ? 'boolean' : 'string');
        }

        return back()->with('success', 'Settings updated successfully');
    }
} 