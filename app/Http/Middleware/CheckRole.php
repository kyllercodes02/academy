<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user() || $request->user()->role !== $role) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }

            // Redirect to appropriate dashboard based on user's role
            if ($request->user()) {
                switch ($request->user()->role) {
                    case 'admin':
                        return redirect()->route('admin.dashboard');
                    case 'teacher':
                        return redirect()->route('teacher.dashboard');
                    case 'guardian':
                        return redirect()->route('guardian.dashboard');
                    default:
                        return redirect()->route('login');
                }
            }

            return redirect()->route('login');
        }

        return $next($request);
    }
} 