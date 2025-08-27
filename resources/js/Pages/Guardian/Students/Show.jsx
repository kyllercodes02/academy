import React from 'react';
import { Head } from '@inertiajs/react';
import GuardianLayout from '@/Layouts/GuardianLayout';
import { GraduationCap, User, Calendar, BookOpen } from 'lucide-react';
import PropTypes from 'prop-types';

const InfoCard = ({ icon: Icon, label, value }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-lg font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

InfoCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export default function Show({ student, user }) {
    return (
        <GuardianLayout user={user}>
            <Head title={`Student - ${student.name}`} />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        View detailed information about your student.
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoCard
                        icon={User}
                        label="Student Name"
                        value={student.name}
                    />
                    <InfoCard
                        icon={GraduationCap}
                        label="Grade Level"
                        value={student.grade_level?.name || 'Not assigned'}
                    />
                    <InfoCard
                        icon={BookOpen}
                        label="Section"
                        value={student.section?.name || 'Not assigned'}
                    />
                    <InfoCard
                        icon={Calendar}
                        label="School Year"
                        value={student.school_year || 'Current'}
                    />
                </div>

                {/* Add more sections here for grades, attendance, etc. */}
            </div>
        </GuardianLayout>
    );
}

Show.propTypes = {
    student: PropTypes.shape({
        name: PropTypes.string.isRequired,
        grade_level: PropTypes.shape({
            name: PropTypes.string,
        }),
        section: PropTypes.shape({
            name: PropTypes.string,
        }),
        school_year: PropTypes.string,
    }).isRequired,
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
    }).isRequired,
}; 