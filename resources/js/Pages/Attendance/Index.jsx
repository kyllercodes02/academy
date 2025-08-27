import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, usePage } from '@inertiajs/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

export default function Attendance({ students, sections, filters, date }) {
  
  const generateSF2 = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const reportDate = new Date(date);
    const month = reportDate.toLocaleString('default', { month: 'long' });
    const year = reportDate.getFullYear();
    const dayOfMonth = reportDate.getDate();

    // Header
    doc.setFontSize(10);
    doc.text('School Form 2 (SF2) Daily Attendance Report of Learners', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text(`(This form is generated for a single day and does not represent the full monthly report)`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    doc.text(`Month of: ${month} ${year}`, 15, 30);
    doc.text(`Grade Level: ${students.data.length > 0 ? students.data[0].grade_level : 'N/A'}`, 15, 35);
    doc.text(`Section: ${students.data.length > 0 ? students.data[0].section : 'N/A'}`, 15, 40);

    // Table
    const tableColumn = ["LEARNER'S NAME (Last Name, First Name, Middle Name)", `${dayOfMonth}`];
    const tableRows = [];

    students.data.forEach(student => {
      const studentData = [
        `${student.last_name}, ${student.first_name}`,
        student.status === 'present' ? '' : 'X' // Use 'X' for absent, blank for present
      ];
      tableRows.push(studentData);
    });

    // Summary columns
    tableColumn.push('Total Absences');
    tableColumn.push('Total Tardy');
    students.data.forEach((student, index) => {
        const absentCount = student.status === 'absent' ? 1 : 0;
        // Tardy data is not available, so we'll put 0.
        tableRows[index].push(absentCount.toString());
        tableRows[index].push('0');
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 100 },
      }
    });

    // Summary Footer
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text('Summary for the Day:', 15, finalY);
    finalY += 7;
    
    const presentCount = students.data.filter(s => s.status === 'present').length;
    const absentCount = students.data.filter(s => s.status === 'absent').length;
    
    doc.text(`Total Present: ${presentCount}`, 20, finalY);
    finalY += 7;
    doc.text(`Total Absent: ${absentCount}`, 20, finalY);

    doc.save(`SF2_Daily_Attendance_${date}.pdf`);
  };

  const [search, setSearch] = useState(filters.search || '');
  const [selectedSection, setSelectedSection] = useState(filters.section || 'All Students');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedSection !== 'All Students') params.append('section', selectedSection);
    
    window.history.pushState({}, '', `${route('admin.attendance.index')}?${params.toString()}`);
  }, [search, selectedSection]);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Attendance</h1>
            <h2 className="text-gray-600">Section</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>
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
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={generateSF2} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Generate SF2
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Print
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.data.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.student_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={route('attendance.history', student.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View History
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.check_in}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {students.links && students.links.length > 3 && (
          <div className="mt-4 flex flex-wrap -mb-1">
            {students.links.map((link, key) => (
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