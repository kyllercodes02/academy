import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuardianLayout from '@/Layouts/GuardianLayout';
import { GraduationCap, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';

const StudentCard = ({ student }) => {
    return (
        <Link
            href={route('guardian.students.show', student.id)}
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-500">
                            {student.grade_level?.name} - {student.section?.name}
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
        </Link>
    );
};

StudentCard.propTypes = {
    student: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        grade_level: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }),
        section: PropTypes.shape({
            name: PropTypes.string.isRequired,
        }),
    }).isRequired,
};

export default function Index({ students, user }) {
    return (
        <GuardianLayout user={user}>
            <Head title="My Students" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900">My Students</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        View and manage your students' information.
                    </p>
                </div>

                <div className="mt-6 space-y-4">
                    {students.length > 0 ? (
                        students.map((student) => (
                            <StudentCard key={student.id} student={student} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                You don't have any students registered yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </GuardianLayout>
    );
}

Index.propTypes = {
    students: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            grade_level: PropTypes.shape({
                name: PropTypes.string.isRequired,
            }),
            section: PropTypes.shape({
                name: PropTypes.string.isRequired,
            }),
        })
    ).isRequired,
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
    }).isRequired,
}; 