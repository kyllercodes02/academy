<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Find the user by email
        $user = User::where('email', $this->input('email'))->first();
        
        // Log authentication attempt details
        Log::info('Authentication attempt', [
            'email' => $this->input('email'),
            'route' => $this->route()->getName(),
            'user_exists' => $user ? 'yes' : 'no',
            'user_role' => $user ? $user->role : 'none',
            'password_provided' => !empty($this->input('password')),
            'password_hashed' => $user ? !empty($user->password) : false
        ]);

        if (!$user) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => 'The provided email address was not found.',
            ]);
        }

        // Check if the user has the correct role for the login route
        $routeName = $this->route()->getName();
        $expectedRole = null;

        if (str_contains($routeName, 'admin.')) {
            $expectedRole = 'admin';
        } elseif (str_contains($routeName, 'teacher.')) {
            $expectedRole = 'teacher';
        } elseif (str_contains($routeName, 'guardian.')) {
            $expectedRole = 'guardian';
        }

        // Log role check details
        Log::info('Role check', [
            'route_name' => $routeName,
            'expected_role' => $expectedRole,
            'user_role' => $user->role
        ]);

        if ($expectedRole && $user->role !== $expectedRole) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => "This account doesn't have {$expectedRole} access.",
            ]);
        }

        // Verify password hash
        $passwordValid = Hash::check($this->input('password'), $user->password);
        Log::info('Password verification', [
            'is_valid' => $passwordValid
        ]);

        if (!$passwordValid) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => 'The provided password is incorrect.',
            ]);
        }

        // Use the default web guard for all authentication
        if (!Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => 'Authentication failed. Please try again.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    private function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('email')).'|'.$this->ip());
    }
}
