import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuardianLayout from '@/Layouts/GuardianLayout';
import { format } from 'date-fns';
import { AlertTriangle, Bell, ChevronLeft } from 'lucide-react';
import PropTypes from 'prop-types';

const PriorityBadge = ({ priority }) => {
    const colors = {
        high: 'bg-red-100 text-red-800 border-red-200',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        low: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>
            {priority === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
};

PriorityBadge.propTypes = {
    priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
};

export default function Show({ announcement, user }) {
    return (
        <GuardianLayout user={user}>
            <Head title={announcement.title} />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <Link
                        href={route('guardian.announcements.index')}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Announcements
                    </Link>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Bell className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-semibold text-gray-900">{announcement.title}</h1>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Posted by {announcement.admin?.name || 'Admin'} on {format(new Date(announcement.created_at), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <PriorityBadge priority={announcement.priority} />
                            </div>

                            <div className="mt-6 prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                            </div>

                            {(announcement.publish_at || announcement.expires_at) && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                        {announcement.publish_at && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Publish Date</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {format(new Date(announcement.publish_at), 'MMMM d, yyyy')}
                                                </dd>
                                            </div>
                                        )}
                                        {announcement.expires_at && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {format(new Date(announcement.expires_at), 'MMMM d, yyyy')}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GuardianLayout>
    );
}

Show.propTypes = {
    announcement: PropTypes.shape({
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
        created_at: PropTypes.string.isRequired,
        publish_at: PropTypes.string,
        expires_at: PropTypes.string,
        admin: PropTypes.shape({
            name: PropTypes.string,
        }),
    }).isRequired,
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
    }).isRequired,
}; 