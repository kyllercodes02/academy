<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    /**
     * Display the settings page
     */
    public function index()
    {
        return Inertia::render('Teacher/Settings', [
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }
}
