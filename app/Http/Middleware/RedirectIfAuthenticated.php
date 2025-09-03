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

        // Avoid special-case redirects that can cause loops/bounces

        // Check if user is authenticated
        if (Auth::check()) {
            // Let authenticated users access non-login pages; block only login pages
            if ($request->is('*/login') || $request->is('login')) {
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

        return $next($request);
    }
} 