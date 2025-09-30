<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AtRiskStudentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AtRiskStudentController extends Controller
{
    protected $atRiskService;

    public function __construct(AtRiskStudentService $atRiskService)
    {
        $this->atRiskService = $atRiskService;
    }

    /**
     * Get at-risk students for admin dashboard
     */
    public function index(Request $request)
    {
        $sectionId = $request->input('section_id');
        $days = $request->input('days', 30);
        
        $data = $this->atRiskService->getAtRiskStatistics($sectionId);
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Get at-risk students for teacher dashboard
     */
    public function teacherIndex(Request $request)
    {
        $user = Auth::user();
        
        // Get teacher's assigned section
        $teacherAssignment = $user->teacherAssignments()->with(['section'])->first();
        
        if (!$teacherAssignment) {
            return response()->json([
                'success' => false,
                'message' => 'No section assigned to teacher'
            ], 403);
        }
        
        $days = $request->input('days', 30);
        $data = $this->atRiskService->getAtRiskStatistics($teacherAssignment->section_id);
        
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Get detailed at-risk student information
     */
    public function show($id)
    {
        $student = \App\Models\Student::with(['section', 'gradeLevel'])
            ->where('id', $id)
            ->where('status', 'active')
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found'
            ], 404);
        }

        $atRiskData = $this->atRiskService->getAtRiskStudents('all', 60);
        $studentData = $atRiskData->where('id', $id)->first();

        if (!$studentData) {
            return response()->json([
                'success' => false,
                'message' => 'Student is not currently at risk'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $studentData
        ]);
    }
}
