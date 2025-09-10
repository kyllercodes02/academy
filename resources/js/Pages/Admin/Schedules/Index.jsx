import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { Upload, Download, Trash2, Plus, FileText } from 'lucide-react';

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function Index({ sections, gradeLevels }) {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [availableSections, setAvailableSections] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [bulkSchedules, setBulkSchedules] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter sections based on selected grade - only show A-E sections
  useEffect(() => {
    if (selectedGrade) {
      const filtered = sections.filter(section => 
        section.grade_level_id == selectedGrade && 
        ['A', 'B', 'C', 'D', 'E'].includes(section.name)
      );
      setAvailableSections(filtered);
      setSelectedSection(''); // Reset section selection
    } else {
      setAvailableSections([]);
      setSelectedSection('');
    }
  }, [selectedGrade, sections]);

  // Fetch schedules when section is selected
  useEffect(() => {
    if (selectedSection) {
      fetchSchedules(selectedSection);
    } else {
      setSchedules({});
    }
  }, [selectedSection]);

  const fetchSchedules = async (sectionId) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(route('admin.schedules.section', { section_id: sectionId }));
      setSchedules(res.data.schedules);
    } catch (e) {
      setError('Failed to load schedules.');
    }
    setLoading(false);
  };

  const handleGradeChange = (gradeId) => {
    setSelectedGrade(gradeId);
    setShowBulkForm(false);
    setShowCSVUpload(false);
    setError('');
    setSuccess('');
  };

  const handleSectionChange = (sectionId) => {
    setSelectedSection(sectionId);
    setShowBulkForm(false);
    setShowCSVUpload(false);
    setError('');
    setSuccess('');
  };

  const addBulkSchedule = () => {
    setBulkSchedules([...bulkSchedules, {
      subject: '',
      teacher_name: '',
      day: 'Monday',
      start_time: '',
      end_time: '',
      room: '',
      description: ''
    }]);
  };

  const updateBulkSchedule = (index, field, value) => {
    const updated = [...bulkSchedules];
    updated[index][field] = value;
    setBulkSchedules(updated);
  };

  const removeBulkSchedule = (index) => {
    setBulkSchedules(bulkSchedules.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSection) {
      setError('Please select a section first.');
      return;
    }

    // Validate all schedules
    for (let i = 0; i < bulkSchedules.length; i++) {
      const schedule = bulkSchedules[i];
      if (!schedule.subject || !schedule.teacher_name || !schedule.start_time || !schedule.end_time) {
        setError(`Please fill all required fields for schedule ${i + 1}`);
        return;
      }
      if (schedule.start_time >= schedule.end_time) {
        setError(`End time must be after start time for schedule ${i + 1}`);
        return;
      }
    }

    try {
      await axios.post(route('admin.schedules.bulk'), {
        section_id: selectedSection,
        schedules: bulkSchedules
      });
      setSuccess('Schedules created successfully.');
      setBulkSchedules([]);
      setShowBulkForm(false);
      fetchSchedules(selectedSection);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create schedules.');
    }
  };

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSection) {
      setError('Please select a section first.');
      return;
    }

    if (!csvFile) {
      setError('Please select a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('section_id', selectedSection);
    formData.append('csv_file', csvFile);

    try {
      await axios.post(route('admin.schedules.upload-csv'), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Schedules imported successfully from CSV.');
      setCsvFile(null);
      setShowCSVUpload(false);
      fetchSchedules(selectedSection);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to upload CSV.');
    }
  };

  const handleExportCSV = async () => {
    if (!selectedSection) {
      setError('Please select a section first.');
      return;
    }

    try {
      const response = await axios.get(route('admin.schedules.export-csv', { section_id: selectedSection }), {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `schedules_${selectedSection}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError('Failed to export CSV.');
    }
  };

  const handleClearSection = async () => {
    if (!selectedSection) {
      setError('Please select a section first.');
      return;
    }

    if (!confirm('Are you sure you want to clear all schedules for this section?')) {
      return;
    }

    try {
      await axios.delete(route('admin.schedules.clear'), {
        data: { section_id: selectedSection }
      });
      setSuccess('All schedules for this section have been cleared.');
      fetchSchedules(selectedSection);
    } catch (e) {
      setError('Failed to clear schedules.');
    }
  };

  const selectedSectionData = sections.find(s => s.id == selectedSection);
  const selectedGradeData = gradeLevels.find(g => g.id == selectedGrade);

  return (
    <AdminLayout>
      <Head title="Class Schedules" />
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">Class Schedules</h1>
          <p className="text-gray-600">Manage class schedules for each section.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
              <select
                value={selectedGrade}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Grade Level</option>
                {gradeLevels.map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={!selectedGrade}
              >
                <option value="">Select Section</option>
                {availableSections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedSectionData && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {selectedGradeData?.name} - Section {selectedSectionData.name}
              </h2>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={() => setShowBulkForm(!showBulkForm)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <Plus size={16} />
                  {showBulkForm ? 'Hide Bulk Form' : 'Add Multiple Schedules'}
                </button>
                
                <button
                  onClick={() => setShowCSVUpload(!showCSVUpload)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  <Upload size={16} />
                  {showCSVUpload ? 'Hide CSV Upload' : 'Upload CSV'}
                </button>
                
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                
                <button
                  onClick={handleClearSection}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  <Trash2 size={16} />
                  Clear All Schedules
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}

              {/* Bulk Schedule Form */}
              {showBulkForm && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">Add Multiple Schedules</h3>
                  <form onSubmit={handleBulkSubmit}>
                    {bulkSchedules.map((schedule, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-white rounded border">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subject</label>
                          <input
                            type="text"
                            value={schedule.subject}
                            onChange={(e) => updateBulkSchedule(index, 'subject', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Teacher</label>
                          <input
                            type="text"
                            value={schedule.teacher_name}
                            onChange={(e) => updateBulkSchedule(index, 'teacher_name', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Day</label>
                          <select
                            value={schedule.day}
                            onChange={(e) => updateBulkSchedule(index, 'day', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                          >
                            {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Start</label>
                            <input
                              type="time"
                              value={schedule.start_time}
                              onChange={(e) => updateBulkSchedule(index, 'start_time', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">End</label>
                            <input
                              type="time"
                              value={schedule.end_time}
                              onChange={(e) => updateBulkSchedule(index, 'end_time', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBulkSchedule(index)}
                            className="mt-6 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addBulkSchedule}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                      >
                        Add Schedule Row
                      </button>
                      {bulkSchedules.length > 0 && (
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          Save All Schedules
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* CSV Upload Form */}
              {showCSVUpload && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">CSV format should be: Day, Subject, Start Time, End Time, Teacher, Room, Description</p>
                    <p className="text-sm text-gray-500">Example: Monday, Mathematics, 08:00, 09:00, John Doe, Room 101, Basic Math</p>
                  </div>
                  <form onSubmit={handleCSVUpload}>
                    <div className="mb-4">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files[0])}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Upload CSV
                    </button>
                  </form>
                </div>
              )}

              {/* Schedule Display */}
              {loading ? (
                <div className="text-center py-8">Loading schedules...</div>
              ) : (
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
                        (schedules[day] && schedules[day].length > 0) ? (
                          schedules[day].map(sched => (
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
                </div>
              )}
              {!loading && Object.values(schedules).flat().length === 0 && (
                <div className="text-gray-500 text-center py-8">No schedules found for this section.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}