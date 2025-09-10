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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage school-wide announcements.</p>
                        </div>
                        <Link
                            href={route('admin.announcements.create')}
                            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Create Announcement
                        </Link>
                    </div>

                    {announcements.data.length === 0 ? (
                        <div className="bg-white sm:rounded-lg border border-dashed border-gray-300 p-10 text-center">
                            <h2 className="text-lg font-medium text-gray-900">No announcements yet</h2>
                            <p className="mt-2 text-sm text-gray-600">Get started by creating your first announcement.</p>
                            <div className="mt-4">
                                <Link
                                    href={route('admin.announcements.create')}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    New Announcement
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow-sm ring-1 ring-gray-200 sm:rounded-lg">
                            <ul className="divide-y divide-gray-200">
                                {announcements.data.map((announcement) => (
                                    <li key={announcement.id} className="transition-colors hover:bg-gray-50">
                                        <div className="px-4 py-5 sm:px-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base font-medium text-gray-900 truncate">
                                                        {announcement.title}
                                                    </p>
                                                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                        {announcement.content}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${priorityColors[announcement.priority]}`}>
                                                        {announcement.priority}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-2">
                                                        {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex justify-end gap-2">
                                                <Link
                                                    href={route('admin.announcements.edit', announcement.id)}
                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={route('admin.announcements.destroy', announcement.id)}
                                                    method="delete"
                                                    as="button"
                                                    onBefore={() => confirm('Delete this announcement?')}
                                                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md"
                                                >
                                                    Delete
                                                </Link>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {announcements.links && (
                        <div className="mt-6">
                            {/* Pagination can go here */}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
} 