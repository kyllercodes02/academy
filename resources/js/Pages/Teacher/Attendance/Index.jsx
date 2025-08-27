import { useState, useEffect } from 'react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { usePage, router, Head } from '@inertiajs/react';
import { Search, Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const statusClasses = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export default function Attendance({ students, sections, filters, date: initialDate }) {
  const { auth } = usePage().props;
  const [date, setDate] = useState(initialDate || '');
  const [search, setSearch] = useState(filters.search || '');
  const [selectedSection, setSelectedSection] = useState(filters.section || 'All Students');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedSection !== 'All Students') params.append('section', selectedSection);
    if (date) params.append('date', date);
    
    const routeName = 'teacher.attendance.index';
    window.history.pushState({}, '', `${route(routeName)}?${params.toString()}`);
  }, [search, selectedSection, date]);

  // Add attendance update handler
  const handleStatusChange = async (studentId, newStatus) => {
    setIsUpdating(true);
    try {
      await router.post(route('teacher.attendance.store'), {
        student_id: studentId,
        date,
        status: newStatus,
      }, {
        preserveScroll: true,
        preserveState: true,
      });
      toast.success('Attendance updated successfully');
    } catch (error) {
      toast.error('Failed to update attendance');
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk update attendance
  const handleBulkUpdate = async (status) => {
    if (!confirm(`Are you sure you want to mark all students as ${status}?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await router.post(route('teacher.attendance.bulk-update'), {
        date,
        status,
      }, {
        preserveScroll: true,
        preserveState: true,
      });
      toast.success(`All students marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update attendance');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <TeacherLayout>
      <Head title="Attendance Management" />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
              <p className="text-gray-600">Manage student attendance for your section</p>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Students</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
            <button
              onClick={() => handleBulkUpdate('present')}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleBulkUpdate('absent')}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Mark All Absent
            </button>
            <button
              onClick={() => handleBulkUpdate('late')}
              disabled={isUpdating}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              Mark All Late
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.data && students.data.length > 0 ? (
                  students.data.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.student_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.card_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(student.status)}
                          <StatusBadge status={student.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.check_in || 'Not recorded'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              student.status === 'present' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-200 text-gray-800 hover:bg-green-100'
                            }`}
                            onClick={() => handleStatusChange(student.id, 'present')}
                            disabled={isUpdating}
                          >
                            Present
                          </button>
                          <button
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              student.status === 'late' 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-gray-200 text-gray-800 hover:bg-yellow-100'
                            }`}
                            onClick={() => handleStatusChange(student.id, 'late')}
                            disabled={isUpdating}
                          >
                            Late
                          </button>
                          <button
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              student.status === 'absent' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-200 text-gray-800 hover:bg-red-100'
                            }`}
                            onClick={() => handleStatusChange(student.id, 'absent')}
                            disabled={isUpdating}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No students found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {students.data && students.data.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Present</p>
                    <p className="text-2xl font-bold text-green-900">
                      {students.data.filter(s => s.status === 'present').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Late</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {students.data.filter(s => s.status === 'late').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Absent</p>
                    <p className="text-2xl font-bold text-red-900">
                      {students.data.filter(s => s.status === 'absent').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {students.data.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
