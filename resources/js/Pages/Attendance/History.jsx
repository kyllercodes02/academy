import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { utcToZonedTime } from 'date-fns-tz';
import { format as formatDateFns } from 'date-fns';

const StatusBadge = ({ status }) => {
  const colors = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (time) => {
  if (!time) return '-';
  const timeString = `1970-01-01T${time}`;
  const zonedDate = utcToZonedTime(new Date(timeString), 'Asia/Manila');
  return formatDateFns(zonedDate, 'h:mm a');
};

export default function AttendanceHistory({ student, history }) {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <Link
            href={route('attendance.index')}
            className="text-blue-600 hover:text-blue-900 flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Attendance
          </Link>
          <h1 className="text-2xl font-bold mt-4">Attendance History</h1>
          <p className="text-gray-600">
            {student.first_name} {student.last_name} - {student.section}
          </p>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.data.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatTime(record.time_in)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {history.links && history.links.length > 3 && (
          <div className="mt-4 flex flex-wrap -mb-1">
            {history.links.map((link, key) => (
              <React.Fragment key={key}>
                {!link.url ? (
                  <div
                    className="mr-1 mb-1 px-4 py-2 text-sm text-gray-500 border rounded"
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ) : (
                  <Link
                    className={`mr-1 mb-1 px-4 py-2 text-sm border rounded hover:bg-gray-50 focus:outline-none ${
                      link.active ? 'bg-blue-600 text-white hover:bg-blue-500' : ''
                    }`}
                    href={link.url}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 