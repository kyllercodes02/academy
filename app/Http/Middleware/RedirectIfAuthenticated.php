<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        // If accessing /login directly, redirect based on role parameter
        if ($request->is('login')) {
            $role = $request->query('role');
            
            if ($role === 'guardian') {
                return redirect()->route('guardian.login');
            } elseif ($role === 'admin') {
                return redirect()->route('admin.login');
            } elseif ($role === 'teacher') {
                return redirect()->route('teacher.login');
            }
        }

        // Check if user is authenticated
        if (Auth::check()) {
            // Always allow logout
            if ($request->is('*/logout')) {
                return $next($request);
            }

            // If not accessing a login page, allow the request
            if (!$request->is('*/login')) {
                return $next($request);
            }

            // Redirect based on user's role
            $user = Auth::user();
            return match($user->role) {
                'admin' => redirect()->intended(RouteServiceProvider::ADMIN_HOME),
                'teacher' => redirect()->intended(RouteServiceProvider::TEACHER_HOME),
                'guardian' => redirect()->intended(RouteServiceProvider::GUARDIAN_HOME),
                default => redirect()->intended(RouteServiceProvider::HOME),
            };
        }

        return $next($request);
    }
} 