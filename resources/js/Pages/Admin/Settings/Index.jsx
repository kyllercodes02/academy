import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';

export default function Settings({ settings: initialSettings }) {
    const [form, setForm] = useState(initialSettings || {
        school_name: 'Zion Academy',
        school_address: '',
        contact_number: '',
        email: '',
        attendance_start: '07:00',
        attendance_end: '17:00',
        late_threshold: '08:00',
        notification_enabled: true,
        sms_notifications: false,
        email_notifications: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        router.post(route('admin.settings.update'), form, {
            preserveScroll: true,
            onSuccess: () => {
                setMessage({ type: 'success', text: 'Settings updated successfully' });
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setMessage({ type: 'error', text: 'Failed to update settings' });
                setIsSubmitting(false);
            }
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <AdminLayout>
            <Head title="Settings" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                    {message && (
                        <div className={`mb-4 p-4 rounded-md ${
                            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="bg-white shadow rounded-lg">
                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            {/* School Information Section */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">School Information</h2>
                                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="school_name" className="block text-sm font-medium text-gray-700">School Name</label>
                                            <input
                                                type="text"
                                                name="school_name"
                                                id="school_name"
                                                value={form.school_name}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="school_address" className="block text-sm font-medium text-gray-700">School Address</label>
                                            <input
                                                type="text"
                                                name="school_address"
                                                id="school_address"
                                                value={form.school_address}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">Contact Number</label>
                                            <input
                                                type="text"
                                                name="contact_number"
                                                id="contact_number"
                                                value={form.contact_number}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance Settings Section */}
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Attendance Settings</h2>
                                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                                        <div>
                                            <label htmlFor="attendance_start" className="block text-sm font-medium text-gray-700">Attendance Start Time</label>
                                            <input
                                                type="time"
                                                name="attendance_start"
                                                id="attendance_start"
                                                value={form.attendance_start}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="attendance_end" className="block text-sm font-medium text-gray-700">Attendance End Time</label>
                                            <input
                                                type="time"
                                                name="attendance_end"
                                                id="attendance_end"
                                                value={form.attendance_end}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="late_threshold" className="block text-sm font-medium text-gray-700">Late Threshold</label>
                                            <input
                                                type="time"
                                                name="late_threshold"
                                                id="late_threshold"
                                                value={form.late_threshold}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notification Settings Section */}
                                <div>
                                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Notification Settings</h2>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    name="notification_enabled"
                                                    id="notification_enabled"
                                                    checked={form.notification_enabled}
                                                    onChange={handleChange}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="notification_enabled" className="font-medium text-gray-700">Enable Notifications</label>
                                                <p className="text-gray-500">Receive notifications for important events</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    name="sms_notifications"
                                                    id="sms_notifications"
                                                    checked={form.sms_notifications}
                                                    onChange={handleChange}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="sms_notifications" className="font-medium text-gray-700">SMS Notifications</label>
                                                <p className="text-gray-500">Send SMS notifications to guardians</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    name="email_notifications"
                                                    id="email_notifications"
                                                    checked={form.email_notifications}
                                                    onChange={handleChange}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="email_notifications" className="font-medium text-gray-700">Email Notifications</label>
                                                <p className="text-gray-500">Send email notifications to guardians</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                        isSubmitting 
                                            ? 'bg-blue-400 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 