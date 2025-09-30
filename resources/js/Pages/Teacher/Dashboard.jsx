import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { format } from 'date-fns';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    AlertCircle,
    Users,
    UserCheck,
    UserX,
    Percent,
    Calendar,
    ArrowUp,
    BarChart2,
    GraduationCap
} from 'lucide-react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import AtRiskStudentsWidget from '@/Components/AtRiskStudentsWidget';

const StatCard = ({ title, value, icon: Icon, color, trend = null }) => (
    <div className={`bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow duration-300 border-l-4 border-${color}-600`}>
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-500">{title}</h4>
            <Icon size={20} className={`text-${color}-600`} />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
            <div className="flex items-center mt-2 text-xs text-green-600">
                <ArrowUp size={14} />
                <span className="ml-1">{trend}</span>
            </div>
        )}
    </div>
);

export default function Dashboard({ 
    students = [], 
    section = null, 
    gradeLevel = null, 
    currentDate = format(new Date(), 'yyyy-MM-dd'),
    message = null 
}) {
    const [attendanceData, setAttendanceData] = useState(students);

    useEffect(() => {
        // Initialize Echo
        window.Pusher = Pusher;
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true
        });

        // Set up real-time listener for attendance updates
        window.Echo.private('attendance')
            .listen('AttendanceUpdated', (e) => {
                setAttendanceData(currentData => {
                    return currentData.map(student => {
                        if (student.id === e.studentId) {
                            return {
                                ...student,
                                attendance: {
                                    status: e.status,
                                    check_in_time: e.checkInTime,
                                    check_out_time: e.checkOutTime,
                                    remarks: e.remarks
                                }
                            };
                        }
                        return student;
                    });
                });
            });

        return () => {
            if (window.Echo) {
                window.Echo.leave('attendance');
            }
        };
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'absent':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'late':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    if (message) {
        return (
            <TeacherLayout>
                <Head title="Dashboard" />
                <div className="p-6">
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                        <p>{message}</p>
                    </div>
                </div>
            </TeacherLayout>
        );
    }

    // Calculate stats
    const totalStudents = attendanceData.length;
    const presentToday = attendanceData.filter(s => s.attendance?.status === 'present').length;
    const absentToday = attendanceData.filter(s => s.attendance?.status === 'absent').length;
    const lateToday = attendanceData.filter(s => s.attendance?.status === 'late').length;
    const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

    return (
        <TeacherLayout>
            <Head title="Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Title */}
                            <div className="flex items-center gap-2 text-2xl font-bold mb-6">
                                <BarChart2 size={24} className="text-blue-700" />
                                <span>Teacher Dashboard</span>
                            </div>

                            {/* Section Info */}
                            {section && gradeLevel && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center space-x-2">
                                        <GraduationCap className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-blue-800">
                                            {section.name} - {gradeLevel.name}
                                        </span>
                                    </div>
                                    <p className="text-blue-600 text-sm mt-1">
                                        Date: {format(new Date(currentDate), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                            )}

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard
                                    title="Total Students"
                                    value={totalStudents}
                                    icon={Users}
                                    color="blue"
                                />
                                <StatCard
                                    title="Present Today"
                                    value={presentToday}
                                    icon={UserCheck}
                                    color="green"
                                />
                                <StatCard
                                    title="Absent Today"
                                    value={absentToday}
                                    icon={UserX}
                                    color="red"
                                />
                                <StatCard
                                    title="Late Today"
                                    value={lateToday}
                                    icon={Clock}
                                    color="yellow"
                                />
                            </div>

                            {/* Attendance Rate */}
                            <div className="mb-8">
                                <StatCard
                                    title="Attendance Rate"
                                    value={`${attendanceRate}%`}
                                    icon={Percent}
                                    color="purple"
                                />
                            </div>

                            {/* At-Risk Students Widget */}
                            <div className="mb-6">
                                <AtRiskStudentsWidget isTeacher={true} />
                            </div>

                            {/* Students Attendance Table */}
                            <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Student
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Card ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Check In
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Check Out
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Remarks
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {attendanceData.map((student) => (
                                                    <tr key={student.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {student.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-500">
                                                                {student.card_id}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                {getStatusIcon(student.attendance?.status)}
                                                                <span className="ml-2 text-sm text-gray-500">
                                                                    {student.attendance?.status || 'Not recorded'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.attendance?.check_in_time || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.attendance?.check_out_time || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {student.attendance?.remarks || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
} 