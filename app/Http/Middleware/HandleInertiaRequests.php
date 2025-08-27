<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Session;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $shared = parent::share($request);
        $user = $request->user();
        $notifications = [];
        if ($user && method_exists($user, 'notifications')) {
            $notifications = $user->unreadNotifications()->latest()->take(10)->get()->toArray();
        }
        return array_merge($shared, [
            'auth' => [
                'user' => $user ? $user->only('id', 'name', 'email') : null,
            ],
            'notifications' => $notifications,
            'flash' => [
                'success' => Session::get('success'),
                'error' => Session::get('error'),
                'warning' => Session::get('warning'),
                'info' => Session::get('info'),
            ],
            'errors' => function () use ($request) {
                if ($request->session()->has('errors')) {
                    return $request->session()->get('errors')->getBag('default')->getMessages();
                }
                
                return (object) [];
            },
            'csrf_token' => csrf_token(),
        ]);
    }
}