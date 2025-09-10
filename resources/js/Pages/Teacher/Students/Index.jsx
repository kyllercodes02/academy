import React from 'react';
import { Head, Link } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { 
    Users, 
    GraduationCap, 
    Mail, 
    Phone, 
    Calendar,
    Eye,
    Edit
} from 'lucide-react';

const StudentCard = ({ student }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-500">Student ID: {student.student_id || 'N/A'}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                        {student.status || 'Active'}
                    </span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{student.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{student.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{student.section?.name || 'No section'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{student.grade_level?.name || 'No grade level'}</span>
                    </div>
                </div>

                {student.guardian && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Guardian Information</h4>
                        <p className="text-sm text-gray-600">{student.guardian.name}</p>
                        {student.guardian.email && (
                            <p className="text-xs text-gray-500">{student.guardian.email}</p>
                        )}
                    </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                    <Link
                        href={route('teacher.students.show', student.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                    </Link>
                    <Link
                        href={route('teacher.students.edit', student.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                    </Link>
                </div>
            </div>
        </div>
    );
};


export default function Index({ students = [] }) {
    // Group students by section
    const studentsBySection = students.reduce((acc, student) => {
        const sectionName = student.section?.name || 'No Section';
        if (!acc[sectionName]) {
            acc[sectionName] = [];
        }
        acc[sectionName].push(student);
        return acc;
    }, {});

    return (
        <TeacherLayout>
            <Head title="My Students" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {/* Title */}
                            <div className="flex items-center gap-2 text-2xl font-bold mb-6">
                                <Users size={24} className="text-blue-700" />
                                <span>My Students</span>
                            </div>


                            {/* Students List */}
                            <div className="space-y-6">
                                {Object.keys(studentsBySection).map((sectionName) => (
                                    <div key={sectionName}>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                                            {sectionName} ({studentsBySection[sectionName].length} students)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {studentsBySection[sectionName].map((student) => (
                                                <StudentCard key={student.id} student={student} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Empty State */}
                            {students.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students assigned</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        You don't have any students assigned to your sections yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
