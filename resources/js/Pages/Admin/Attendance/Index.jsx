import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format as formatDateFns } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar, BookOpen, Download, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export default function Index({ 
    students: initialStudents = [], 
    sections = [], 
    currentSection = 'all',
    currentDate = formatDateFns(new Date(), 'yyyy-MM-dd'), 
    filters = {} 
}) {
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [selectedSection, setSelectedSection] = useState(currentSection || 'all');
    const [students, setStudents] = useState(initialStudents);
    const [loading, setLoading] = useState(false);
    const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
    const [checkoutStudentId, setCheckoutStudentId] = useState(null);
    const [studentNumber, setStudentNumber] = useState('');
    const [checkoutError, setCheckoutError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Calculate attendance statistics
    const stats = students.reduce((acc, student) => {
        const status = student.attendance?.status || 'absent';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, { present: 0, late: 0, absent: 0 });

    useEffect(() => {
        // Initialize Echo
        window.Pusher = Pusher;
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true
        });

        // Set up real-time listener for attendance updates
        window.Echo.private('attendance')
            .listen('AttendanceUpdated', (e) => {
                setStudents(currentStudents => {
                    return currentStudents.map(student => {
                        if (student.id === e.studentId) {
                            return {
                                ...student,
                                attendance: {
                                    status: e.status,
                                    check_in_time: e.checkInTime,
                                    check_out_time: e.checkOutTime,
                                    remarks: e.remarks
                                }
                            };
                        }
                        return student;
                    });
                });
            });

        return () => {
            if (window.Echo) {
                window.Echo.leave('attendance');
            }
        };
    }, []);

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        updateFilters({ date });
    };

    const handleSectionChange = (e) => {
        const section = e.target.value;
        setSelectedSection(section);
        updateFilters({ section });
    };

    const updateFilters = (newFilters) => {
        loadAttendanceData({ ...filters, ...newFilters });
    };

    const loadAttendanceData = async (filterParams) => {
        setLoading(true);
        try {
            const response = await fetch(route('admin.attendance.data', filterParams));
            const data = await response.json();
            if (data.students) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Failed to load attendance data:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedDate !== currentDate || selectedSection !== currentSection) {
            loadAttendanceData({
                date: selectedDate,
                section: selectedSection
            });
        }
    }, [selectedDate, selectedSection]);

    const handleStatusUpdate = async (studentId, newStatus) => {
        setLoading(true);
        try {
            await router.post(route('admin.attendance.update'), {
                student_id: studentId,
                date: selectedDate,
                status: newStatus,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        } catch (error) {
            console.error('Failed to update attendance:', error);
        }
        setLoading(false);
    };

    const handleCheckOut = (studentId) => {
        setCheckoutStudentId(studentId);
        setStudentNumber('');
        setCheckoutError('');
        setShowCheckoutDialog(true);
    };

    const handleCheckOutSubmit = () => {
        if (!studentNumber.trim()) {
            setCheckoutError('Please enter the student number');
            return;
        }

        router.post(route('admin.attendance.record-check-out'), {
            student_id: checkoutStudentId,
            date: selectedDate,
            student_number: studentNumber,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowCheckoutDialog(false);
                loadAttendanceData({
                    date: selectedDate,
                    section: selectedSection
                });
            },
            onError: (error) => {
                setCheckoutError(error.message || 'Invalid student number provided.');
            }
        });
    };

    const handleBulkUpdate = (status) => {
        if (!selectedSection) {
            alert('Please select a section first');
            return;
        }

        router.post(route('admin.attendance.bulk-update'), {
            date: selectedDate,
            section: selectedSection,
            status: status,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                loadAttendanceData({
                    date: selectedDate,
                    section: selectedSection
                });
            }
        });
    };

    const handleExport = () => {
        window.location.href = route('admin.attendance.export', {
            date: selectedDate,
            section: selectedSection,
        });
    };

    const formatTime = (time) => {
        if (!time) return '-';
        const timeString = `2000-01-01T${time}`;
        const zonedDate = utcToZonedTime(new Date(timeString), 'Asia/Manila');
        return formatDateFns(zonedDate, 'h:mm a');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'absent':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'late':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.section?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head title="Attendance Management" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="md:flex md:items-center md:justify-between mb-6">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Attendance Management
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Present</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.present}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Late</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.late}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100 text-red-600">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Absent</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.absent}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="all">All Sections</option>
                                    {sections.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search students..."
                                        className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Actions */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleBulkUpdate('present')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark All Present
                        </button>
                        <button
                            onClick={() => handleBulkUpdate('late')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Mark All Late
                        </button>
                        <button
                            onClick={() => handleBulkUpdate('absent')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Mark All Absent
                        </button>
                    </div>
                </div>

                {/* Student Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Section
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check In
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Check Out
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                                            <p className="mt-2 text-gray-600">Loading students...</p>
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-600">
                                            No students found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{student.section}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    student.attendance.status === 'present'
                                                        ? 'bg-green-100 text-green-800'
                                                        : student.attendance.status === 'late'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {getStatusIcon(student.attendance.status)}
                                                    <span className="ml-1">{student.attendance.status}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatTime(student.attendance.check_in_time)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatTime(student.attendance.check_out_time)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    <button
                                                        onClick={() => handleStatusUpdate(student.id, 'present')}
                                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                    >
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(student.id, 'late')}
                                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                                    >
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Late
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(student.id, 'absent')}
                                                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Absent
                                                    </button>
                                                    {student.attendance.status !== 'absent' && !student.attendance.check_out_time && (
                                                        <button
                                                            onClick={() => handleCheckOut(student.id)}
                                                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Check Out
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Checkout Dialog */}
            {showCheckoutDialog && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Student Check Out</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Enter Student Number
                            </label>
                            <input
                                type="text"
                                value={studentNumber}
                                onChange={(e) => setStudentNumber(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Student Number"
                            />
                            {checkoutError && (
                                <p className="mt-2 text-sm text-red-600">{checkoutError}</p>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setShowCheckoutDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCheckOutSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                Check Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
} 