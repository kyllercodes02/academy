import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, TrendingDown, Clock, Calendar, User } from 'lucide-react';
import axios from 'axios';

const AtRiskStudentsWidget = ({ sectionId = null, isTeacher = false }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchAtRiskStudents();
    }, [sectionId]);

    const fetchAtRiskStudents = async () => {
        try {
            setLoading(true);
            setError(null);
            const endpoint = isTeacher ? '/api/at-risk-students/teacher' : '/api/at-risk-students';
            const response = await axios.get(endpoint, {
                params: { section_id: sectionId }
            });
            
            if (response.data && response.data.success) {
                setData(response.data.data);
            } else {
                setError(response.data?.message || 'Failed to fetch data');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch at-risk students data';
            setError(errorMessage);
            console.error('Error fetching at-risk students:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getRiskIcon = (level) => {
        switch (level) {
            case 'high': return <AlertTriangle className="h-4 w-4" />;
            case 'medium': return <TrendingDown className="h-4 w-4" />;
            case 'low': return <Clock className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-red-600">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!data || data.total_at_risk === 0) {
        return (
            <div className="bg-white rounded-lg shadow">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">At-Risk Students</h3>
                                <p className="text-sm text-gray-600">Students requiring attention</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <div className="text-xs text-gray-500">Total</div>
                        </div>
                    </div>
                </div>

                {/* No At-Risk Students Message */}
                <div className="p-6">
                    <div className="text-center text-green-600">
                        <Users className="h-8 w-8 mx-auto mb-2" />
                        <h3 className="font-semibold mb-1">No At-Risk Students</h3>
                        <p className="text-sm text-gray-600">All students are maintaining good attendance!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">At-Risk Students</h3>
                            <p className="text-sm text-gray-600">Students requiring attention</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">{data.total_at_risk}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                </div>
            </div>

            {/* Risk Level Summary */}
            <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-red-600">{data.high_risk}</div>
                        <div className="text-xs text-gray-500">High Risk</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-yellow-600">{data.medium_risk}</div>
                        <div className="text-xs text-gray-500">Medium Risk</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{data.low_risk}</div>
                        <div className="text-xs text-gray-500">Low Risk</div>
                    </div>
                </div>
            </div>

            {/* At-Risk Students List - Positioned at Bottom */}
            <div className="max-h-96 overflow-y-auto">
                {data.students && data.students.length > 0 ? (
                    data.students.map((student) => (
                        <div
                            key={student.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelectedStudent(student)}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    {student.photo_url ? (
                                        <img
                                            src={student.photo_url}
                                            alt={student.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {student.name}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(student.risk_level)}`}>
                                            {getRiskIcon(student.risk_level)}
                                            <span className="ml-1 capitalize">{student.risk_level}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>{student.section}</span>
                                        <span>Grade {student.grade_level}</span>
                                        <span>{student.attendance_rate}% attendance</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {student.consecutive_absent > 0 ? `${student.consecutive_absent} days absent` : 'Present'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Last: {student.last_attendance ? new Date(student.last_attendance).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-gray-500">
                        <Users className="h-8 w-8 mx-auto mb-2" />
                        <p>No at-risk students found</p>
                    </div>
                )}
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Student Details</h3>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    {selectedStudent.photo_url ? (
                                        <img
                                            src={selectedStudent.photo_url}
                                            alt={selectedStudent.name}
                                            className="h-16 w-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-8 w-8 text-gray-500" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-medium">{selectedStudent.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            Grade {selectedStudent.grade_level} • {selectedStudent.section}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Attendance Rate</div>
                                        <div className="text-lg font-semibold">{selectedStudent.attendance_rate}%</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Absent Days</div>
                                        <div className="text-lg font-semibold">{selectedStudent.absent_days}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Late Days</div>
                                        <div className="text-lg font-semibold">{selectedStudent.late_days}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">Consecutive Absent</div>
                                        <div className="text-lg font-semibold">{selectedStudent.consecutive_absent}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-gray-900 mb-2">Risk Factors:</div>
                                    <ul className="space-y-1">
                                        {selectedStudent.risk_factors.map((factor, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-center">
                                                <AlertTriangle className="h-3 w-3 text-orange-500 mr-2" />
                                                {factor}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtRiskStudentsWidget;
