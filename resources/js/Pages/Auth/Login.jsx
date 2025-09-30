import { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Mail, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login.store'));
    };

    return (
        <GuestLayout>
            <Head title="Login" />

            <div className="w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <img
                                src="/images/logo.png"
                                alt="Zion Academy Logo"
                                className="h-16 w-16 object-contain"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">Login Portal</h2>
                        <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
                    </div>

                    {status && (
                        <div className="mb-4 font-medium text-sm text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <Mail className="h-5 w-5" />
                                </span>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-10"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full pr-10"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-600">Remember me</span>
                            </label>

                            {canResetPassword && (
                                <a
                                    href={route('password.request')}
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    Forgot your password?
                                </a>
                            )}
                        </div>

                        <div className="space-y-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${processing ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                <LogIn className="h-5 w-5 mr-2" />
                                {processing ? 'Signing in...' : 'Login'}
                            </button>
                            <p className="text-center text-xs text-gray-500">Secured by Zion Academy Admin System</p>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}