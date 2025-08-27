<?php

use App\Http\Controllers\Guardian\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Guardian\DashboardController;
use App\Http\Controllers\Guardian\StudentController;
use App\Http\Controllers\Guardian\AttendanceController;
use App\Http\Controllers\Guardian\ProfileController;
use App\Http\Controllers\Guardian\AnnouncementController;
use App\Http\Controllers\Guardian\ScheduleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guardian guest routes (login)
Route::middleware('guest')->group(function () {
    Route::get('guardian', [AuthenticatedSessionController::class, 'create'])
        ->name('guardian.login');
    Route::post('guardian', [AuthenticatedSessionController::class, 'store'])
        ->name('guardian.login.store');
});

// Guardian authenticated routes
Route::middleware(['web', 'auth.guardian'])->prefix('guardian')->name('guardian.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Students
    Route::get('/students', [StudentController::class, 'index'])
        ->name('students.index');
    Route::get('/students/{student}', [StudentController::class, 'show'])
        ->name('students.show');

    // Attendance
    Route::get('/attendance', [AttendanceController::class, 'index'])
        ->name('attendance.index');
    Route::get('/attendance/export', [AttendanceController::class, 'export'])
        ->name('attendance.export');

    // Announcements
    Route::get('/announcements', [AnnouncementController::class, 'index'])
        ->name('announcements.index');
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show'])
        ->name('announcements.show');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('profile.update');

    // Schedules
    Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
    Route::get('/schedules/child/{childId}', [ScheduleController::class, 'getChildSchedule'])->name('schedules.child');

    // Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
}); 