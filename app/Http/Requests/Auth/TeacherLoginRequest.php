<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\TeacherSection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class TeacherLoginRequest extends FormRequest
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
        Log::info('Teacher authentication attempt', [
            'email' => $this->input('email'),
            'user_exists' => $user ? 'yes' : 'no',
            'user_role' => $user ? $user->role : 'none',
        ]);

        if (!$user) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => 'The provided email address was not found.',
            ]);
        }

        // Check if the user has teacher role
        if ($user->role !== 'teacher') {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => "This account doesn't have teacher access.",
            ]);
        }

        // Verify password
        if (!Hash::check($this->input('password'), $user->password)) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => 'The provided password is incorrect.',
            ]);
        }

        // Authenticate using the default web guard
        if (!Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => 'Authentication failed. Please try again.',
            ]);
        }

        // Load teacher sections into session after successful authentication
        $teacher = Auth::user();
        $sections = TeacherSection::where('teacher_id', $teacher->id)
            ->where('academic_year', date('Y') . '-' . (date('Y') + 1))
            ->get(['section', 'grade_level'])
            ->groupBy('grade_level')
            ->map(function ($sections) {
                return $sections->pluck('section')->toArray();
            })
            ->toArray();

        session(['teacher_sections' => $sections]);

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
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