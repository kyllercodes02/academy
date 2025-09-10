import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { format as formatDateFns } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    AlertCircle, 
    Calendar, 
    Download, 
    Filter, 
    Search, 
    ChevronDown, 
    ChevronUp,
    MoreVertical,
    Check,
    X
} from 'lucide-react';
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
    const [showBulkActions, setShowBulkActions] = useState(false);


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

        const confirmMessage = `Are you sure you want to mark all students in ${selectedSection === 'all' ? 'all sections' : 'the selected section'} as ${status}?`;
        if (!confirm(confirmMessage)) return;

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
                setShowBulkActions(false);
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
                return <CheckCircle className="w-4 h-4 text-emerald-600" />;
            case 'absent':
                return <XCircle className="w-4 h-4 text-red-500" />;
            case 'late':
                return <Clock className="w-4 h-4 text-amber-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'absent':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'late':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
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
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                            Attendance Management
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Track and manage student attendance records
                        </p>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                    </div>
                </div>


                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                                    <select
                                        value={selectedSection}
                                        onChange={handleSectionChange}
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search students..."
                                            className="block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bulk Actions */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Bulk Actions</h3>
                        <div className="relative">
                            <button
                                onClick={() => setShowBulkActions(!showBulkActions)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                <MoreVertical className="w-4 h-4 mr-2" />
                                Bulk Actions
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </button>
                            
                            <AnimatePresence>
                                {showBulkActions && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                                    >
                                        <div className="py-1">
                                            <button
                                                onClick={() => handleBulkUpdate('present')}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-3 text-emerald-600" />
                                                Mark All Present
                                            </button>
                                            <button
                                                onClick={() => handleBulkUpdate('late')}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors duration-200"
                                            >
                                                <Clock className="w-4 h-4 mr-3 text-amber-600" />
                                                Mark All Late
                                            </button>
                                            <button
                                                onClick={() => handleBulkUpdate('absent')}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                                            >
                                                <XCircle className="w-4 h-4 mr-3 text-red-600" />
                                                Mark All Absent
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                                            <p className="mt-4 text-gray-600">Loading students...</p>
                                        </td>
                                    </tr>
                                ) : filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-600">
                                            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-lg font-medium">No students found</p>
                                            <p className="text-sm">Try adjusting your filters or search criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{student.section}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.attendance.status)}`}>
                                                    {getStatusIcon(student.attendance.status)}
                                                    <span className="ml-1 capitalize">{student.attendance.status}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatTime(student.attendance.check_in_time)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatTime(student.attendance.check_out_time)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(student.id, 'present')}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                                                    >
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(student.id, 'late')}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                                                    >
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Late
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(student.id, 'absent')}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                                    >
                                                        <X className="w-3 h-3 mr-1" />
                                                        Absent
                                                    </button>
                                                    {student.attendance.status !== 'absent' && !student.attendance.check_out_time && (
                                                        <button
                                                            onClick={() => handleCheckOut(student.id)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Student Check Out</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Student Number
                            </label>
                            <input
                                type="text"
                                value={studentNumber}
                                onChange={(e) => setStudentNumber(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Student Number"
                            />
                            {checkoutError && (
                                <p className="mt-2 text-sm text-red-600">{checkoutError}</p>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCheckoutDialog(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCheckOutSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
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