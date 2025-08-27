import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import GuardianLayout from '@/Layouts/GuardianLayout';
import { format } from 'date-fns';
import { Link } from '@inertiajs/react';
import { AlertTriangle, Bell, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import Echo from 'laravel-echo';

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

const AnnouncementCard = ({ announcement }) => {
    return (
        <Link
            href={route('guardian.announcements.show', announcement.id)}
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        <p className="text-sm text-gray-500">
                            Posted by {announcement.admin?.name || 'Admin'} on {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <PriorityBadge priority={announcement.priority} />
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
            </div>
            <div className="mt-4">
                <p className="text-gray-600 line-clamp-2">{announcement.content}</p>
            </div>
        </Link>
    );
};

AnnouncementCard.propTypes = {
    announcement: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
        created_at: PropTypes.string.isRequired,
        admin: PropTypes.shape({
            name: PropTypes.string,
        }),
    }).isRequired,
};

export default function Index({ announcements: initialAnnouncements, user }) {
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [newAnnouncementNotification, setNewAnnouncementNotification] = useState(null);

    useEffect(() => {
        // Subscribe to the announcements channel
        if (window.Echo) {
            window.Echo.channel('announcements')
                .listen('.NewAnnouncementCreated', (e) => {
                    console.log('New announcement received:', e);
                    
                    // Show notification
                    setNewAnnouncementNotification({
                        title: e.title,
                        priority: e.priority
                    });

                    // Update announcements list
                    setAnnouncements(prev => {
                        const newData = [e, ...(prev.data || [])];
                        return {
                            ...prev,
                            data: newData.slice(0, 10) // Keep only 10 items
                        };
                    });

                    // Show browser notification if permitted
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('New Announcement', {
                            body: e.title,
                            icon: '/favicon.ico'
                        });
                    }
                });

            // Cleanup subscription
            return () => {
                window.Echo.leave('announcements');
            };
        } else {
            console.warn('Echo is not initialized. Real-time updates will not work.');
        }
    }, []);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const refreshAnnouncements = () => {
        router.reload({ only: ['announcements'] });
        setNewAnnouncementNotification(null);
    };

    return (
        <GuardianLayout user={user}>
            <Head title="Announcements" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Stay updated with the latest announcements from the school administration.
                    </p>
                </div>

                {newAnnouncementNotification && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 text-blue-400 mr-2" />
                                <span className="text-sm text-blue-700">
                                    New announcement: {newAnnouncementNotification.title}
                                </span>
                            </div>
                            <button
                                onClick={refreshAnnouncements}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Refresh to view
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-6 space-y-4">
                    {announcements.data.length > 0 ? (
                        announcements.data.map((announcement) => (
                            <AnnouncementCard key={announcement.id} announcement={announcement} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <Bell className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                There are no announcements at the moment.
                            </p>
                        </div>
                    )}
                </div>

                {announcements.links && announcements.links.length > 3 && (
                    <div className="mt-6">
                        {/* Pagination links here */}
                    </div>
                )}
            </div>
        </GuardianLayout>
    );
}

Index.propTypes = {
    announcements: PropTypes.shape({
        data: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            priority: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
            created_at: PropTypes.string.isRequired,
            admin: PropTypes.shape({
                name: PropTypes.string,
            }),
        })).isRequired,
        links: PropTypes.array,
    }).isRequired,
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
    }).isRequired,
}; 