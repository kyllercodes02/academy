<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => route('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // If there is an intended URL set by middleware and it's not welcome/login/register, honor it
        $intended = $request->session()->pull('url.intended');
        if ($intended) {
            $intendedPath = parse_url($intended, PHP_URL_PATH);
            if ($intendedPath && !in_array($intendedPath, ['/', '/login', '/register'])) {
                return redirect()->to($intended);
            }
        }

        // If authenticated via admin guard, go to admin home immediately
        if (Auth::guard('admin')->check()) {
            return redirect()->intended(RouteServiceProvider::ADMIN_HOME);
        }

        // Otherwise, use default user roles to redirect
        $user = Auth::user();
        if ($user && isset($user->role)) {
            return match($user->role) {
                'teacher' => redirect()->intended(RouteServiceProvider::TEACHER_HOME),
                'guardian' => redirect()->intended(RouteServiceProvider::GUARDIAN_HOME),
                'admin' => redirect()->intended(RouteServiceProvider::ADMIN_HOME),
                default => redirect()->intended(RouteServiceProvider::HOME),
            };
        }

        return redirect()->intended(RouteServiceProvider::HOME);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
