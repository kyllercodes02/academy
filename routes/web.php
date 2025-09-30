<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\Admin\NotificationController;
use App\Events\AlertTriggered;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Welcome Screen Routes (Public)
Route::get('/', [WelcomeController::class, 'index'])->name('welcome');
Route::post('/check-card', [WelcomeController::class, 'checkCard'])->name('welcome.check-card');
Route::post('/student-info', [WelcomeController::class, 'getStudentInfo'])->name('welcome.student-info');
Route::post('/security-alert', [\App\Http\Controllers\SecurityAlertController::class, 'store']);

// Include role-specific auth routes
require __DIR__.'/admin-auth.php';     // Load admin routes
require __DIR__.'/teacher-auth.php';   // Load teacher routes
require __DIR__.'/guardian-auth.php';  // Load guardian routes

// Include general auth routes (login, register, etc.)
require __DIR__.'/auth.php';           // Load general auth routes

// Shared authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Profile routes (available to all authenticated users)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Teacher Dashboard Routes
Route::middleware(['auth', 'role:teacher'])->prefix('teacher')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Teacher\DashboardController::class, 'index'])->name('teacher.dashboard');
});

// Broadcasting Authentication Route
Broadcast::routes(['middleware' => ['auth:web,admin']]);

// Student Routes
Route::post('/students/lookup-by-card', [StudentController::class, 'lookupByCard'])
    ->name('students.lookup-by-card');

// Admin Notifications (ensure admin guard via is.admin middleware)
Route::middleware(['web', 'is.admin'])->prefix('admin')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('admin.notifications.index');
    Route::get('/notifications/fetch', [NotificationController::class, 'fetch'])->name('admin.notifications.fetch');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('admin.notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('admin.notifications.read_all');
});

// Dev route to trigger a test alert
Route::get('/dev/test-alert', function () {
    $payload = [
        'title' => 'Student Alert: John Doe',
        'message' => 'Possible health issue reported in classroom 3B',
        'url' => '/admin/alerts/123',
        'level' => 'critical',
    ];
    event(new AlertTriggered($payload));
    return response()->json(['success' => true, 'message' => 'Alert dispatched']);
});
