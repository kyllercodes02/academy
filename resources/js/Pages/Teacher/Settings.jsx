import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { Settings as SettingsIcon, User, Shield, Bell, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Settings({ auth }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    const { data, setData, patch, processing, errors } = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        patch(route('teacher.profile.update'), {
            onSuccess: () => {
                toast.success('Profile updated successfully!');
                setData('current_password', '');
                setData('password', '');
                setData('password_confirmation', '');
            },
            onError: () => {
                toast.error('Failed to update profile');
            },
        });
    };

    return (
        <TeacherLayout>
            <Head title="Settings" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <SettingsIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                            <p className="text-gray-600">Manage your account settings and preferences</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Settings */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                <User className="h-5 w-5 mr-2 text-blue-600" />
                                Profile Information
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <hr className="my-6" />

                                {/* Password Change Section */}
                                <div>
                                    <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                                        <Shield className="h-4 w-4 mr-2 text-green-600" />
                                        Change Password
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        {/* Current Password */}
                                        <div>
                                            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="current_password"
                                                    value={data.current_password}
                                                    onChange={(e) => setData('current_password', e.target.value)}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.current_password && (
                                                <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    id="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                            )}
                                        </div>

                                        {/* Confirm New Password */}
                                        <div>
                                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                id="password_confirmation"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            {errors.password_confirmation && (
                                                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                            processing
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Update Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Information Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Bell className="h-5 w-5 mr-2 text-green-600" />
                                Account Information
                            </h3>
                            
                            <div className="space-y-4 text-sm text-gray-600">
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Account Details</h4>
                                    <div className="space-y-2">
                                        <p><strong>Role:</strong> Teacher</p>
                                        <p><strong>Member Since:</strong> {new Date(auth.user.created_at).toLocaleDateString()}</p>
                                        <p><strong>Last Updated:</strong> {new Date(auth.user.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Password Requirements</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>At least 8 characters long</li>
                                        <li>Contains at least one uppercase letter</li>
                                        <li>Contains at least one lowercase letter</li>
                                        <li>Contains at least one number</li>
                                        <li>Contains at least one special character</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-2">Security Tips</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Use a strong, unique password</li>
                                        <li>Never share your password with others</li>
                                        <li>Log out when using shared computers</li>
                                        <li>Keep your email address updated</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
