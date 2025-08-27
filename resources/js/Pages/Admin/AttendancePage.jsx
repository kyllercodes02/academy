// Enhanced AttendancePage.jsx with NFC integration
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { format } from 'date-fns';
import { usePage, Head } from '@inertiajs/react';
import { Clock, Users } from 'lucide-react';

const POLLING_INTERVAL = 3000; // 3 seconds

const AttendancePage = () => {
  const { auth, csrf_token } = usePage().props;
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [section, setSection] = useState('Section A');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
  });

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf_token;
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  }, [csrf_token]);

  const sections = [
    'Section A', 'Section B', 'Section C', 'Section D',
    'Section E', 'Section F', 'Section G', 'Section H',
  ];

  // Calculate attendance statistics
  const calculateStats = useCallback((studentsData) => {
    const stats = studentsData.reduce((acc, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      acc.total = studentsData.length;
      return acc;
    }, { present: 0, absent: 0, late: 0, total: 0 });
    
    setAttendanceStats(stats);
  }, []);

  // Fetch attendance data
  const fetchAttendanceData = useCallback(async () => {
    try {
      const response = await axios.get(`/admin/attendance/data`, {
        params: {
          date: selectedDate,
          section: section
        }
      });
      
      if (JSON.stringify(response.data.students) !== JSON.stringify(students)) {
        setStudents(response.data.students);
        calculateStats(response.data.students);
      }
      
      if (error) setError(null);
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, section, students, error, calculateStats]);

  // Set up polling
  useEffect(() => {
    fetchAttendanceData();
    
    let pollInterval;
    if (isPolling) {
      pollInterval = setInterval(fetchAttendanceData, POLLING_INTERVAL);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [fetchAttendanceData, isPolling]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await axios.post(`/admin/attendance/update`, {
        student_id: studentId,
        date: selectedDate,
        status: newStatus
      });
      
      fetchAttendanceData();
    } catch (err) {
      console.error('Error updating attendance:', err);
      alert('Failed to update attendance status');
    }
  };

  const togglePolling = () => {
    setIsPolling(prev => !prev);
  };

  // Bulk mark all as present/absent
  const bulkMarkAttendance = async (status) => {
    if (!confirm(`Mark all students in ${section} as ${status}?`)) return;
    
    try {
      await axios.post('/admin/attendance/bulk-update', {
        section: section,
        date: selectedDate,
        status: status
      });
      
      fetchAttendanceData();
    } catch (err) {
      console.error('Error bulk updating attendance:', err);
      alert('Failed to bulk update attendance');
    }
  };

  return (
    <AdminLayout>
      <Head title="Attendance Management" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Section Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sections.map((sectionName) => (
                  <option key={sectionName} value={sectionName}>
                    {sectionName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Auto-refresh Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auto-refresh</label>
              <button 
                onClick={togglePolling}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  isPolling 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {isPolling ? 'Auto-refresh On' : 'Auto-refresh Off'}
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-blue-800">{attendanceStats.total}</p>
                </div>
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Present</p>
                  <p className="text-2xl font-bold text-green-800">{attendanceStats.present}</p>
                </div>
                <Clock className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Late</p>
                  <p className="text-2xl font-bold text-yellow-800">{attendanceStats.late}</p>
                </div>
                <Clock className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-800">{attendanceStats.absent}</p>
                </div>
                <Clock className="text-red-500" size={24} />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => bulkMarkAttendance('present')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Mark All Present
            </button>
            <button
              onClick={() => bulkMarkAttendance('absent')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.status === 'present' ? 'bg-green-100 text-green-800' :
                          student.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={student.status}
                          onChange={(e) => handleStatusChange(student.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AttendancePage;