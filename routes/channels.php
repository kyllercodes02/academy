<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Admin channel for notifications
Broadcast::channel('admin', function ($user) {
    // This authorization logic allows users with the 'admin' role to listen to this channel.
    // You can adjust this based on your application's user roles and permissions.
    return $user && $user->role === 'admin';
});

// Attendance channel authorization
Broadcast::channel('attendance', function ($user) {
    return $user->role === 'admin' || $user->role === 'teacher';
});


// Announcements channel authorization
Broadcast::channel('announcements', function ($user) {
    return true; // All authenticated users can receive announcements
});

// Private student channel
Broadcast::channel('student.{id}', function ($user, $id) {
    if ($user->role === 'admin') {
        return true;
    }
    
    if ($user->role === 'teacher') {
        return $user->canAccessStudent($id);
    }
    
    if ($user->role === 'guardian') {
        return $user->students()->where('students.id', $id)->exists();
    }
    
    return false;
});

// Admin channel authorization
Broadcast::channel('App.Models.Admin.{id}', function ($admin, $id) {
    return (int) $admin->id === (int) $id;
}, ['guards' => ['admin']]); 