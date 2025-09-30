<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Attendance;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome');
    }

    public function checkCard(Request $request)
    {
        $request->validate([
            'card_id' => 'required|string',
        ]);

        $student = Student::with(['section', 'gradeLevel', 'todayAttendance', 'primaryAuthorizedPerson', 'authorizedPersons' => function($query) {
            $query->where('is_active', true)->orderBy('is_primary', 'desc');
        }])
            ->whereRaw('LOWER(card_id) = ?', [strtolower(trim($request->card_id))])
            ->where('status', 'active')
            ->first();

        if (!$student) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid card or inactive student.',
            ], 404);
        }

        $now = Carbon::now();
        $todayAttendance = $student->todayAttendance;

        if (!$todayAttendance) {
            // Check in
            $attendance = Attendance::create([
                'student_id' => $student->id,
                'check_in_time' => $now->format('H:i:s'),
                'status' => $now->hour >= 8 ? 'late' : 'present',
                'date' => $now->toDateString(),
            ]);

            event(new \App\Events\AttendanceUpdated(
                $student->id,
                $attendance->status,
                $attendance->check_in_time,
                null,
                null
            ));

            return response()->json([
                'status' => 'success',
                'message' => 'Student checked in successfully.',
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'section' => $student->section->name,
                    'grade_level' => $student->gradeLevel->name,
                    'photo_url' => $student->photo_url,
                ],
                'check_in_time' => $attendance->check_in_time,
                'status' => $attendance->status,
                'action' => 'check_in',
            ]);
        }

        // Student already checked in, perform check out
        if (!$todayAttendance->check_out_time) {
            $todayAttendance->update([
                'check_out_time' => $now->format('H:i:s'),
            ]);

            // Refresh the model to get the updated check_out_time
            $todayAttendance->refresh();

            event(new \App\Events\AttendanceUpdated(
                $student->id,
                $todayAttendance->status,
                $todayAttendance->check_in_time,
                $todayAttendance->check_out_time,
                $todayAttendance->remarks
            ));

            return response()->json([
                'status' => 'success',
                'message' => 'Student checked out successfully.',
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'section' => $student->section->name,
                    'grade_level' => $student->gradeLevel->name,
                    'photo_url' => $student->photo_url,
                ],
                'check_in_time' => $todayAttendance->check_in_time,
                'check_out_time' => $todayAttendance->check_out_time,
                'status' => $todayAttendance->status,
                'action' => 'check_out',
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Student has already checked out for today.',
            'action' => 'already_checked_out',
        ], 400);
    }

    public function getStudentInfo(Request $request)
    {
        $request->validate([
            'card_id' => 'required|string',
        ]);

        $student = Student::with(['section', 'gradeLevel', 'todayAttendance', 'primaryAuthorizedPerson', 'authorizedPersons' => function($query) {
            $query->where('is_active', true)->orderBy('is_primary', 'desc');
        }])
            ->whereRaw('LOWER(card_id) = ?', [strtolower(trim($request->card_id))])
            ->where('status', 'active')
            ->first();

        if (!$student) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid card or inactive student.',
            ], 404);
        }

        $now = Carbon::now();
        $todayAttendance = $student->todayAttendance;

        $response = [
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'grade_level' => $student->gradeLevel->name,
                'student_section' => $student->section->name,
                'photo_url' => $student->photo_url,
                'authorized_persons' => $student->authorizedPersons->map(function ($person) {
                    return [
                        'id' => $person->id,
                        'name' => $person->name,
                        'relationship' => $person->relationship,
                        'contact_number' => $person->contact_number,
                        'email' => $person->email,
                        'is_primary' => $person->is_primary,
                    ];
                }),
                'primary_authorized_person' => $student->primaryAuthorizedPerson ? [
                    'id' => $student->primaryAuthorizedPerson->id,
                    'name' => $student->primaryAuthorizedPerson->name,
                    'relationship' => $student->primaryAuthorizedPerson->relationship,
                    'contact_number' => $student->primaryAuthorizedPerson->contact_number,
                    'email' => $student->primaryAuthorizedPerson->email,
                ] : null,
            ],
        ];

        if (!$todayAttendance) {
            // Check in
            $attendance = Attendance::create([
                'student_id' => $student->id,
                'check_in_time' => $now->format('H:i:s'),
                'status' => $now->hour >= 8 ? 'late' : 'present',
                'date' => $now->toDateString(),
            ]);
            event(new \App\Events\AttendanceUpdated(
                $student->id,
                $attendance->status,
                $attendance->check_in_time,
                null,
                null
            ));

            $response['message'] = 'Check-in successful';
            $response['check_in_time'] = $attendance->check_in_time;
            $response['status'] = $attendance->status;
            $response['action'] = 'check_in';
        } else {
            if (!$todayAttendance->check_out_time) {
                // Update with check-out time
                $todayAttendance->update([
                    'check_out_time' => $now->format('H:i:s'),
                ]);
                
                // Refresh the model to get the updated check_out_time
                $todayAttendance->refresh();

                event(new \App\Events\AttendanceUpdated(
                    $student->id,
                    $todayAttendance->status,
                    $todayAttendance->check_in_time,
                    $todayAttendance->check_out_time,
                    $todayAttendance->remarks
                ));
                
                $response['message'] = 'Check-out successful';
                $response['action'] = 'check_out';
            } else {
                $response['message'] = 'Already checked out for today';
                $response['action'] = 'already_checked_out';
            }
            
            $response['check_in_time'] = $todayAttendance->check_in_time;
            $response['check_out_time'] = $todayAttendance->check_out_time;
            $response['status'] = $todayAttendance->status;
        }

        return response()->json($response);
    }
} 