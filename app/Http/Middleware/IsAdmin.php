<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Set admin guard as the default for this request
        Auth::shouldUse('admin');

        // Allow access to login routes without authentication
        if ($request->routeIs('admin.login') || $request->is('admin/login')) {
            // If already authenticated, redirect to dashboard
            if (Auth::guard('admin')->check()) {
                return redirect()->route('admin.dashboard');
            }
            return $next($request);
        }

        // For all other admin routes, require authentication
        if (!Auth::guard('admin')->check()) {
            return redirect()->route('login')->with('error', 'Please log in to access the admin panel.');
        }

        return $next($request);
    }
} 