<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\WelcomeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes
Route::post('/student-info', [WelcomeController::class, 'getStudentInfo']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // User Info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Attendance Management
        Route::prefix('attendance')->group(function () {
            Route::get('/', [AttendanceController::class, 'getAttendance']);
            Route::post('/update', [AttendanceController::class, 'updateAttendance']);
            Route::post('/record', [AttendanceController::class, 'recordAttendance']);
        });
    });

    // Teacher Routes
    Route::middleware('role:teacher')->prefix('teacher')->group(function () {
        // Add teacher-specific routes here
    });

    // Guardian Routes
    Route::middleware('role:guardian')->prefix('guardian')->group(function () {
        // Add guardian-specific routes here
    });
}); 