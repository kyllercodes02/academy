import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import GuardianLayout from '@/Layouts/GuardianLayout';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function Index({ children, schedules, message }) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id || '');

  const selectedSchedule = selectedChildId && schedules[selectedChildId] ? schedules[selectedChildId].schedules : {};
  const selectedChild = children.find(child => child.id === selectedChildId);

  return (
    <GuardianLayout>
      <Head title="Class Schedule" />
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">Class Schedule</h1>
          <p className="text-gray-600">View your child's class schedule by section.</p>
        </div>
        {message && <div className="text-red-600">{message}</div>}
        {children.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} ({child.section?.name || 'No Section'})
                  </option>
                ))}
              </select>
            </div>
            {selectedChild && selectedChild.section && (
              <div className="mb-4">
                <div className="font-semibold text-lg mb-1">Section: {selectedChild.section.name}</div>
                <div className="text-gray-500 mb-2">Grade: {selectedChild.section.grade_level?.name || 'N/A'}</div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {daysOfWeek.map(day => (
                    (selectedSchedule && selectedSchedule[day] && selectedSchedule[day].length > 0) ? (
                      selectedSchedule[day].map(sched => (
                        <tr key={sched.id}>
                          <td className="px-4 py-2 whitespace-nowrap">{sched.day}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{sched.subject}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{sched.teacher_name}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{sched.start_time.substring(0,5)} - {sched.end_time.substring(0,5)}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{sched.room}</td>
                          <td className="px-4 py-2 whitespace-nowrap">{sched.description}</td>
                        </tr>
                      ))
                    ) : null
                  ))}
                </tbody>
              </table>
              {(!selectedSchedule || Object.values(selectedSchedule).flat().length === 0) && (
                <div className="text-gray-500 text-center py-8">No schedule found for this child.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </GuardianLayout>
  );
} 