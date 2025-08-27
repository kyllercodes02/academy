<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Skip role check for logout routes
        if ($request->is('*/logout')) {
            return $next($request);
        }

        // Check if user is authenticated
        if (!Auth::check()) {
            return match($role) {
                'admin' => redirect()->route('admin.login'),
                'teacher' => redirect()->route('teacher.login'),
                'guardian' => redirect()->route('guardian.login'),
                default => redirect()->route('login'),
            };
        }

        // Check if user has the required role
        $user = Auth::user();
        if ($user->role === $role) {
            return $next($request);
        }

        // If trying to access a login page, allow it
        if ($request->is('*/login')) {
            return $next($request);
        }

        // Unauthorized access
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Redirect based on user's actual role
        return match($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('teacher.dashboard'),
            'guardian' => redirect()->route('guardian.dashboard'),
            default => redirect()->route('login'),
        };
    }
} 