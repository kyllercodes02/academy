<?php

use App\Http\Controllers\Teacher\DashboardController;
use App\Http\Controllers\Teacher\StudentController;
use App\Http\Controllers\Teacher\AttendanceController;
use App\Http\Controllers\Teacher\ProfileController;
use App\Http\Controllers\Teacher\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\PasswordController;
use Illuminate\Support\Facades\Route;

// Teacher guest routes (login and password reset)
Route::middleware(['web', 'guest'])->prefix('teacher')->name('teacher.')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->name('login.store');

    // Password Reset Routes
    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');
    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

// Teacher authenticated routes
Route::middleware(['auth', 'role:teacher'])->prefix('teacher')->name('teacher.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Students
    Route::get('/students', [StudentController::class, 'index'])
        ->name('students.index');
    Route::get('/students/{student}', [StudentController::class, 'show'])
        ->name('students.show');
    Route::get('/students/{student}/edit', [StudentController::class, 'edit'])
        ->name('students.edit');
    Route::put('/students/{student}', [StudentController::class, 'update'])
        ->name('students.update');

    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index'])
        ->name('attendance.index');
    Route::post('/attendance', [AttendanceController::class, 'store'])
        ->name('attendance.store');
    Route::get('/attendance/export', [AttendanceController::class, 'export'])
        ->name('attendance.export');
    Route::post('/attendance/bulk-update', [AttendanceController::class, 'bulkUpdate'])
        ->name('attendance.bulk-update');

    // SF2 Reports
    Route::get('/sf2', [App\Http\Controllers\Teacher\SF2Controller::class, 'index'])
        ->name('sf2.index');
    Route::post('/sf2/generate', [App\Http\Controllers\Teacher\SF2Controller::class, 'generate'])
        ->name('sf2.generate');
    Route::get('/sf2/download', [App\Http\Controllers\Teacher\SF2Controller::class, 'download'])
        ->name('sf2.download');

    // Settings
    Route::get('/settings', [App\Http\Controllers\Teacher\SettingsController::class, 'index'])
        ->name('settings.index');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    // Password Confirmation
    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');
    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);
    Route::put('password', [PasswordController::class, 'update'])
        ->name('password.update');

    // Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
}); 