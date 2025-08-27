import React from 'react';
import { Head } from '@inertiajs/react';
import GuardianLayout from '@/Layouts/GuardianLayout';
import { format } from 'date-fns';
import { Users, Calendar, Bell } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, description }) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="p-6">
            <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-50">
                    <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {description && (
                        <p className="text-sm text-gray-500">{description}</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const AttendanceStatus = ({ status }) => {
    const colors = {
        present: 'bg-green-100 text-green-800',
        late: 'bg-yellow-100 text-yellow-800',
        absent: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const StudentCard = ({ student }) => (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">
                        Section: {student.student_section}
                        <br />
                        Grade Level: {student.grade_level}
                    </p>
                </div>
                {student.today_attendance && (
                    <div>
                        <AttendanceStatus status={student.today_attendance.status} />
                    </div>
                )}
            </div>
            
            {student.recent_attendances && student.recent_attendances.length > 0 ? (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Attendance</h4>
                    <div className="space-y-2">
                        {student.recent_attendances.map((attendance, index) => (
                            <div key={`${student.id}-${index}`} className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">
                                    {format(new Date(attendance.date), 'MMM d, yyyy')}
                                    {attendance.check_in_time && ` - ${format(new Date(`2000-01-01T${attendance.check_in_time}`), 'h:mm a')}`}
                                </span>
                                <AttendanceStatus status={attendance.status} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="mt-4 text-sm text-gray-500">No recent attendance records</p>
            )}
        </div>
    </div>
);

export default function Dashboard({ user, students }) {
    return (
        <GuardianLayout user={user}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="px-4 sm:px-0">
                        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user.name}</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Here's an overview of your students' attendance and recent activities.
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            icon={Users}
                            title="Total Students"
                            value={students.length}
                            description="Students under your guardianship"
                        />
                        <StatCard
                            icon={Calendar}
                            title="Today's Date"
                            value={format(new Date(), 'MMMM d, yyyy')}
                            description="School calendar"
                        />
                        <StatCard
                            icon={Bell}
                            title="Notifications"
                            value="0"
                            description="No new notifications"
                        />
                    </div>

                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Your Students</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {students.map((student) => (
                                <StudentCard key={student.id} student={student} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </GuardianLayout>
    );
}