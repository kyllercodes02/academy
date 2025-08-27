import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format } from 'date-fns';

export default function Index({ announcements }) {
    const priorityColors = {
        low: 'bg-blue-100 text-blue-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-red-100 text-red-800',
    };

    return (
        <AdminLayout>
            <Head title="Announcements" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
                        <Link
                            href={route('admin.announcements.create')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Create Announcement
                        </Link>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {announcements.data.map((announcement) => (
                                <li key={announcement.id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-indigo-600 truncate">
                                                    {announcement.title}
                                                </p>
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <span className="truncate">
                                                        {announcement.content.substring(0, 150)}
                                                        {announcement.content.length > 150 ? '...' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end ml-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[announcement.priority]}`}>
                                                    {announcement.priority}
                                                </span>
                                                <span className="text-sm text-gray-500 mt-2">
                                                    {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end space-x-3">
                                            <Link
                                                href={route('admin.announcements.edit', announcement.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={route('admin.announcements.destroy', announcement.id)}
                                                method="delete"
                                                as="button"
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {announcements.links && (
                        <div className="mt-6">
                            {/* Add pagination component here */}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
} 