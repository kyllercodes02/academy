<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateGuardian
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check() || Auth::user()->role !== 'guardian') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            
            // Store the intended URL in the session
            if (!$request->is('guardian')) {
                session(['url.intended' => $request->url()]);
            }
            
            return redirect()->route('guardian.login');
        }

        // Add the guardian user to the request for easy access in views
        $request->merge(['guardian_user' => Auth::user()]);
        
        return $next($request);
    }
} 