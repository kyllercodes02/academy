import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format as formatDateFns } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { CreditCard, User, Clock, Calendar, CheckCircle2, XCircle, Scan, Wifi, Zap, Shield, UserCheck } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default function Welcome() {
    const { props } = usePage();
    const [status, setStatus] = useState('Ready to scan...');
    const [student, setStudent] = useState(null);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [cardId, setCardId] = useState('');
    const [showFullScreen, setShowFullScreen] = useState(false);
    const [isCheckOut, setIsCheckOut] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showCardDetected, setShowCardDetected] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    // Reset states function
    const resetStates = () => {
        setCardId('');
        setError(null);
        setStatus('Ready to scan...');
        setShowCardDetected(false);
        setIsScanning(false);
        setLoading(false);
        setShowSuccess(false);
        setStudent(null);
        setShowFullScreen(false);
        setIsCheckOut(false);
        // Re-focus the input
        const input = document.getElementById('card-input');
        if (input) {
            input.focus();
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const input = document.getElementById('card-input');
        if (input) {
            input.focus();
        }
    }, []);

    useEffect(() => {
        let timer;
        if (showSuccess) {
            timer = setTimeout(() => {
                setShowSuccess(false);
                setStudent(null);
                setCardId('');
                setShowCardDetected(false);
                const input = document.getElementById('card-input');
                if (input) {
                    input.focus();
                }
            }, 10000); // 10 seconds
        }
        return () => clearTimeout(timer);
    }, [showSuccess]);

    // Show Inertia flash success message as toast
    useEffect(() => {
        if (props.success) {
            toast.success(props.success);
        }
    }, [props.success]);

    // Listen for real-time SecurityAlertNotification via Echo
    useEffect(() => {
        if (!window.Echo) {
            // Initialize Echo if not already initialized
            const key = import.meta.env.VITE_PUSHER_APP_KEY;
            const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;
            if (key && cluster) {
                window.Pusher = Pusher;
                window.Echo = new Echo({
                    broadcaster: 'pusher',
                    key,
                    cluster,
                    forceTLS: true
                });
            }
        }
        if (window.Echo) {
            const channel = window.Echo.private('admin')
                .notification((notification) => {
                    if (notification.type === 'security_alert' && notification.message) {
                        toast.custom((t) => (
                            <div className="bg-red-600 text-white px-6 py-4 rounded shadow-lg flex items-center space-x-3">
                                <Shield className="h-6 w-6 text-white mr-2" />
                                <div>
                                    <div className="font-bold">Security Alert</div>
                                    <div>{notification.message}</div>
                                    <div className="text-xs mt-1">Student: {notification.name} | Grade: {notification.grade_level} | Section: {notification.student_section}</div>
                                    <div className="text-xs">Time: {notification.time}</div>
                                </div>
                            </div>
                        ), { duration: 8000 });
                    }
                });
            return () => {
                if (window.Echo && channel) {
                    window.Echo.leave('private-admin');
                }
            };
        }
    }, []);

    // Listen for real-time AttendanceUpdated to show API-like message
    useEffect(() => {
        if (!window.Echo) return;

        const publicChannel = window.Echo.channel('attendance.public')
            .listen('AttendanceUpdated', (e) => {
                const msg = e?.message || `${e?.studentName || 'A student'} has ${e?.checkOutTime ? 'checked out' : 'checked in'}.`;
                toast.success(msg);
            });

        return () => {
            if (window.Echo) {
                window.Echo.leave('attendance.public');
            }
        };
    }, []);

    const handleCardSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!cardId?.trim()) {
            setError('Please scan your card');
            return;
        }

        setLoading(true);
        setIsScanning(true);
        setShowCardDetected(true);
        try {
            setStatus('Processing card...');
            
            const cleanCardId = cardId.trim();
            
            const response = await axios.post('/student-info', {
                card_id: cleanCardId
            });

            const { student, message, action } = response.data;
            
            setIsCheckOut(action === 'check_out' || action === 'already_checked_out');
            
            setStudent({
                ...student,
                check_in_time: response.data.check_in_time,
                check_out_time: response.data.check_out_time,
                status: response.data.status
            });
            
            setStatus(`✓ ${message}`);
            
            if (action !== 'already_checked_out') {
                setShowFullScreen(true);
                setShowSuccess(true);
                toast.success(message);
                
                // Auto-reset after showing success message
                setTimeout(() => {
                    resetStates();
                }, 3000);
            } else {
                toast.error(message);
                setTimeout(() => {
                    resetStates();
                }, 2000);
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.message || 'Failed to read card');
            
            setTimeout(() => {
                resetStates();
            }, 2000);
        } finally {
            setLoading(false);
            setIsScanning(false);
        }
    };

    const handleClose = () => {
        resetStates();
    };

    const formatTime = (time) => {
        if (!time) return null;
        try {
            const dateString = `2000-01-01T${time}`;
            const zonedDate = utcToZonedTime(new Date(dateString), 'Asia/Manila');
            return formatDateFns(zonedDate, 'h:mm a');
        } catch (error) {
            console.error('Time formatting error:', error);
            return null;
        }
    };

    const handleSendAlert = async () => {
        if (!student) return;
        try {
            await axios.post('/security-alert', {
                student_id: student.id,
                name: student.name,
                grade_level: student.grade_level,
                student_section: student.student_section,
                time: new Date().toISOString(),
            });
            setShowAlert(true);
        } catch (e) {
            toast.error('Failed to send alert.');
        }
    };

   if (showFullScreen && student) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                </div>

                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                    >
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                <div className="relative max-w-5xl w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                                    <UserCheck className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Student Access</h1>
                                    <p className="text-blue-100">Attendance Verification</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white/90 text-sm">
                                    {formatDateFns(currentTime, 'MMM dd, yyyy')}
                                </div>
                                <div className="text-white font-mono text-lg">
                                    {formatDateFns(currentTime, 'HH:mm:ss')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Student Photo & Basic Info */}
                            <div className="lg:col-span-1">
                                <div className="text-center">
                                    <div className="relative flex flex-col items-center mb-6">
                                        {student.photo_url ? (
                                            <div className="bg-white rounded-2xl shadow-2xl border-8 border-blue-300 flex items-center justify-center p-2" style={{ width: 300, height: 300 }}>
                                                <img
                                                    src={student.photo_url}
                                                    alt={student.name}
                                                    className="h-72 w-72 rounded-xl object-cover shadow-lg"
                                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-72 w-72 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-8 border-blue-300 shadow-2xl">
                                                <User className="h-24 w-24 text-blue-600" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-4 border-white shadow-lg">
                                            <CheckCircle2 className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{student.name}</h2>
                                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
                                        <span className="text-gray-600 font-medium">Grade {student.grade_level}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-600 font-medium">{student.student_section}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-600 font-medium capitalize">{student.gender}</span>
                                    </div>

                                    {/* Authorized Person Information */}
                                    {student.primary_authorized_person && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <UserCheck className="h-5 w-5 text-blue-600" />
                                                <h3 className="text-lg font-semibold text-blue-900">Authorized for Pickup</h3>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xl font-bold text-blue-800">{student.primary_authorized_person.name}</p>
                                                <p className="text-blue-600 font-medium">{student.primary_authorized_person.relationship}</p>
                                                <p className="text-sm text-blue-700 mt-1">{student.primary_authorized_person.contact_number}</p>
                                                {student.primary_authorized_person.email && (
                                                    <p className="text-sm text-blue-600">{student.primary_authorized_person.email}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Authorized Persons */}
                                    {student.authorized_persons && student.authorized_persons.length > 1 && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Other Authorized Persons:</h4>
                                            <div className="space-y-1">
                                                {student.authorized_persons
                                                    .filter(person => !person.is_primary)
                                                    .slice(0, 2)
                                                    .map((person, index) => (
                                                    <div key={index} className="text-sm text-gray-600">
                                                        <span className="font-medium">{person.name}</span> - {person.relationship}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* ALERT BUTTON */}
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            onClick={handleSendAlert}
                                            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors duration-200"
                                        >
                                            <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414-1.414A9 9 0 105.636 18.364l1.414 1.414A9 9 0 1018.364 5.636z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
                                            Alert Admin: Possible Fake Student
                                        </button>
                                    </div>
                                    {showAlert && (
                                        <div className="fixed inset-0 flex items-center justify-center z-50">
                                            <div className="bg-black bg-opacity-40 absolute inset-0" onClick={() => setShowAlert(false)}></div>
                                            <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
                                                <div className="flex items-center mb-4">
                                                    <svg className="h-10 w-10 text-red-600 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414-1.414A9 9 0 105.636 18.364l1.414 1.414A9 9 0 1018.364 5.636z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
                                                    <span className="text-xl font-bold text-red-700">Alert Sent!</span>
                                                </div>
                                                <p className="text-gray-700 text-center mb-4">A notification has been sent to the admin.<br/>Possible fake student detected at the entrance.</p>
                                                <button
                                                    onClick={() => setShowAlert(false)}
                                                    className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status & Time Information */}
                            <div className="lg:col-span-2">
                                <div className="space-y-6">
                                    {/* Status Card */}
                                    <div className={`p-6 rounded-2xl border-2 ${
                                        isCheckOut 
                                            ? 'bg-red-50 border-red-200' 
                                            : 'bg-green-50 border-green-200'
                                    }`}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-full ${
                                                isCheckOut 
                                                    ? 'bg-red-500' 
                                                    : 'bg-green-500'
                                            }`}>
                                                {isCheckOut ? (
                                                    <XCircle className="h-8 w-8 text-white" />
                                                ) : (
                                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`text-2xl font-bold ${
                                                    isCheckOut ? 'text-red-700' : 'text-green-700'
                                                }`}>
                                                    {isCheckOut ? 'Checked Out' : 'Checked In'}
                                                </h3>
                                                <p className={`${
                                                    isCheckOut ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {isCheckOut ? 'Have a safe trip home!' : 'Welcome to school!'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Check-in Time */}
                                        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="p-2 bg-blue-500 rounded-lg">
                                                    <Clock className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-lg font-semibold text-blue-900">Check-in Time</h4>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-700">
                                                {formatTime(student.check_in_time) || 'Not recorded'}
                                            </p>
                                        </div>

                                        {/* Check-out Time */}
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="p-2 bg-gray-500 rounded-lg">
                                                    <Clock className="h-5 w-5 text-white" />
                                                </div>
                                                <h4 className="text-lg font-semibold text-gray-900">Check-out Time</h4>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-700">
                                                {formatTime(student.check_out_time) || 'Not recorded'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Secure Access</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Zap className="h-4 w-4" />
                                <span>Real-time Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 relative overflow-hidden">
                {/* ... (animated background elements remain unchanged) */}

                <div className="relative min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl">
                        {/* Header with Logo */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-6">
                                <img src="/images/logo.png" alt="Zion Academy Logo" className="h-20 w-auto" />
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to Zion Academy</h1>
                            <div className="flex items-center justify-center space-x-4 text-gray-600">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    <span>{formatDateFns(currentTime, 'HH:mm:ss')}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    <span>{formatDateFns(currentTime, 'MMM dd, yyyy')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Main Card */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
                            {/* Tech-inspired background pattern */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Circuit board pattern */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="absolute top-4 left-4 w-32 h-px bg-blue-500"></div>
                                    <div className="absolute top-4 left-4 w-px h-32 bg-blue-500"></div>
                                    <div className="absolute top-4 right-4 w-32 h-px bg-blue-500"></div>
                                    <div className="absolute top-4 right-36 w-px h-32 bg-blue-500"></div>
                                    <div className="absolute bottom-4 left-4 w-32 h-px bg-blue-500"></div>
                                    <div className="absolute bottom-36 left-4 w-px h-32 bg-blue-500"></div>
                                    <div className="absolute bottom-4 right-4 w-32 h-px bg-blue-500"></div>
                                    <div className="absolute bottom-4 right-36 w-px h-32 bg-blue-500"></div>
                                </div>

                                {/* Animated scanning field */}
                                <div className="absolute inset-0">
                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse"></div>
                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent transform rotate-90 animate-pulse animation-delay-1000"></div>
                                </div>

                                {/* Enhanced scanning animation */}
                                {isScanning && (
                                    <>
                                        {/* Ripple effect */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-40 h-40 rounded-full border-2 border-blue-400/40 animate-ping"></div>
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-blue-500/60 animate-ping animation-delay-500"></div>
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-blue-600/80 animate-ping animation-delay-1000"></div>
                                        </div>
                                        
                                        {/* Scanning beam */}
                                        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-blue-500/20 via-transparent to-blue-500/20 animate-scan-beam"></div>
                                        
                                        {/* Central scanning icon */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                                                <Wifi className="w-8 h-8 text-white animate-pulse" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Header Section */}
                            <div className="text-center mb-10 relative z-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 shadow-lg">
                                    <div className="relative">
                                        <CreditCard className="h-10 w-10 text-white" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">NFC Access Point</h2>
                                <p className="text-gray-600 text-lg">Present your student card to the reader</p>
                                
                                {/* Tech indicators */}
                                <div className="flex items-center justify-center space-x-6 mt-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span>NFC Ready</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500"></div>
                                        <span>Secure Connection</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleCardSubmit} className="space-y-8">
                                {/* Hidden input for card ID */}
                                <input
                                    type="text"
                                    id="card-input"
                                    value={cardId}
                                    onChange={(e) => setCardId(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    className="sr-only"
                                    autoComplete="off"
                                    autoFocus
                                    disabled={loading || showSuccess}
                                />

                                {/* Enhanced Card Detection Status */}
                                <div className="relative">
                                    <div className="h-40 flex items-center justify-center">
                                        {showCardDetected ? (
                                            <div className="text-center animate-fade-in">
                                                <div className="relative inline-block mb-4">
                                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                                    </div>
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 animate-ping opacity-25"></div>
                                                </div>
                                                <p className="text-xl font-semibold text-green-600">Card Authenticated</p>
                                                <p className="text-sm text-green-500 mt-1">Processing student data...</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="relative inline-block mb-4">
                                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-dashed border-blue-300">
                                                        <Scan className="w-10 h-10 text-blue-600 animate-pulse" />
                                                    </div>
                                                    {/* Scanning field visualization */}
                                                    <div className="absolute inset-0 rounded-2xl">
                                                        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-pulse"></div>
                                                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent animate-pulse animation-delay-500"></div>
                                                    </div>
                                                </div>
                                                <p className="text-xl font-medium text-gray-700">Scanning for NFC Card</p>
                                                <p className="text-sm text-gray-500 mt-1">Hold your card near the reader</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Enhanced Status Messages */}
                                {error && (
                                    <div className="flex items-center space-x-3 text-red-600 bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 shadow-sm">
                                        <div className="p-2 bg-red-500 rounded-full">
                                            <XCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Access Denied</p>
                                            <p className="text-sm">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {!error && status !== 'Ready to scan...' && (
                                    <div className="flex items-center space-x-3 text-green-600 bg-gradient-to-r from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200 shadow-sm">
                                        <div className="p-2 bg-green-500 rounded-full">
                                            <CheckCircle2 className="h-5 w-5 text-white animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Access Granted</p>
                                            <p className="text-sm">{status}</p>
                                        </div>
                                    </div>
                                )}
                            </form>

                            {/* Tech footer */}
                            <div className="mt-8 pt-6 border-t border-gray-200 relative z-10">
                                <div className="flex items-center justify-center space-x-8 text-xs text-gray-400">
                                    <div className="flex items-center space-x-1">
                                        <Shield className="h-3 w-3" />
                                        <span>Encrypted</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Zap className="h-3 w-3" />
                                        <span>Real-time</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Wifi className="h-3 w-3" />
                                        <span>NFC 13.56MHz</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan-wave {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                .animate-scan-wave {
                    animation: scan-wave 2s linear infinite;
                }

                @keyframes scanner-light {
                    0% {
                        transform: translateY(-100%);
                    }
                    100% {
                        transform: translateY(100%);
                    }
                }

                .animate-scanner-light {
                    animation: scanner-light 2s linear infinite;
                }

                @keyframes scan-beam {
                    0% {
                        transform: translateY(-100%) scaleY(0.1);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100%) scaleY(0.1);
                        opacity: 0;
                    }
                }

                .animate-scan-beam {
                    animation: scan-beam 2s ease-in-out infinite;
                }

                @keyframes fade-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }

                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-500 {
                    animation-delay: 0.5s;
                }

                .animation-delay-1000 {
                    animation-delay: 1s;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}