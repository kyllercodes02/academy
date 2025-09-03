<?php

use App\Http\Controllers\Admin\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\GuardianController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\AnnouncementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin guest routes (login)
Route::middleware(['web', 'guest'])->prefix('admin')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('admin.login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->name('admin.login.store');
});

// Admin authenticated routes
Route::middleware(['web', 'auth:admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [App\Http\Controllers\Admin\AdminController::class, 'index'])
        ->name('admin.dashboard');

    // User Management
    Route::resource('users', UserController::class)
        ->except(['show'])
        ->names([
            'index' => 'admin.users.index',
            'create' => 'admin.users.create',
            'store' => 'admin.users.store',
            'edit' => 'admin.users.edit',
            'update' => 'admin.users.update',
            'destroy' => 'admin.users.destroy',
        ]);

    // Teacher Management
    Route::resource('teachers', TeacherController::class)
        ->names([
            'index' => 'admin.teachers.index',
            'create' => 'admin.teachers.create',
            'store' => 'admin.teachers.store',
            'edit' => 'admin.teachers.edit',
            'update' => 'admin.teachers.update',
            'destroy' => 'admin.teachers.destroy',
        ]);

    // Student Management
    Route::resource('students', StudentController::class)
        ->names([
            'index' => 'admin.students.index',
            'create' => 'admin.students.create',
            'store' => 'admin.students.store',
            'show' => 'admin.students.show',
            'edit' => 'admin.students.edit',
            'update' => 'admin.students.update',
            'destroy' => 'admin.students.destroy',
        ]);
    Route::post('/students/import', [StudentController::class, 'import'])->name('admin.students.import');
    Route::post('/students/upload-csv', [StudentController::class, 'uploadCSV'])->name('admin.students.upload-csv');

    // Guardian Management
    Route::resource('guardians', GuardianController::class)
        ->except(['show'])
        ->names([
            'index' => 'admin.guardians.index',
            'create' => 'admin.guardians.create',
            'store' => 'admin.guardians.store',
            'edit' => 'admin.guardians.edit',
            'update' => 'admin.guardians.update',
            'destroy' => 'admin.guardians.destroy',
        ]);

    // Attendance Management
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('admin.attendance.index');
    Route::post('/attendance', [AttendanceController::class, 'store'])->name('admin.attendance.store');
    Route::get('/attendance/data', [\App\Http\Controllers\Admin\AttendanceController::class, 'getData'])->name('admin.attendance.data');
    Route::post('/attendance/update', [AttendanceController::class, 'update'])->name('admin.attendance.update');
    Route::post('/attendance/bulk-update', [AttendanceController::class, 'bulkUpdate'])->name('admin.attendance.bulk-update');
    Route::get('/attendance/export', [AttendanceController::class, 'export'])->name('admin.attendance.export');
    Route::post('/attendance/record-check-out', [AttendanceController::class, 'recordCheckOut'])->name('admin.attendance.record-check-out');

    // Announcement routes
    Route::resource('announcements', AnnouncementController::class)
        ->names([
            'index' => 'admin.announcements.index',
            'create' => 'admin.announcements.create',
            'store' => 'admin.announcements.store',
            'show' => 'admin.announcements.show',
            'edit' => 'admin.announcements.edit',
            'update' => 'admin.announcements.update',
            'destroy' => 'admin.announcements.destroy',
        ]);

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])
        ->name('admin.settings.index');
    Route::post('/settings', [SettingController::class, 'update'])
        ->name('admin.settings.update');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])
        ->name('admin.profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])
        ->name('admin.profile.update');

    // Card Registration
    Route::get('/card-registration', [StudentController::class, 'cardRegistration'])
        ->name('admin.card-registration');
    Route::post('/students/{student}/register-card', [StudentController::class, 'registerCard'])
        ->name('admin.students.register-card');
    Route::delete('/students/{student}/unregister-card', [StudentController::class, 'unregisterCard'])
        ->name('admin.students.unregister-card');

    // Schedule Management
    Route::get('/schedules', [\App\Http\Controllers\Admin\ScheduleController::class, 'index'])->name('admin.schedules.index');
    Route::get('/schedules/section', [\App\Http\Controllers\Admin\ScheduleController::class, 'getSchedules'])->name('admin.schedules.section');
    Route::post('/schedules', [\App\Http\Controllers\Admin\ScheduleController::class, 'store'])->name('admin.schedules.store');
    Route::put('/schedules/{schedule}', [\App\Http\Controllers\Admin\ScheduleController::class, 'update'])->name('admin.schedules.update');
    Route::delete('/schedules/{schedule}', [\App\Http\Controllers\Admin\ScheduleController::class, 'destroy'])->name('admin.schedules.destroy');
    Route::post('/schedules/bulk', [\App\Http\Controllers\Admin\ScheduleController::class, 'bulkStore'])->name('admin.schedules.bulk');
    Route::delete('/schedules/section/clear', [\App\Http\Controllers\Admin\ScheduleController::class, 'clearSection'])->name('admin.schedules.clear');
    Route::post('/schedules/upload-csv', [\App\Http\Controllers\Admin\ScheduleController::class, 'uploadCSV'])->name('admin.schedules.upload-csv');
    Route::get('/schedules/export-csv', [\App\Http\Controllers\Admin\ScheduleController::class, 'exportCSV'])->name('admin.schedules.export-csv');

    // Notifications
    Route::get('/notifications/fetch', [UserController::class, 'fetchNotifications'])->name('admin.notifications.fetch');
    Route::post('/notifications/mark-read', [UserController::class, 'markNotificationsAsRead'])->name('admin.notifications.mark-read');

    // Logout
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('admin.logout');
});