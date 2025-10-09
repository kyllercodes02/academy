import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { FileText, Download, Calendar, BookOpen, Users, GraduationCap, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SF2Generation({ section, gradeLevel }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const { flash } = usePage().props;
    
    const { data, setData, post, processing, errors } = useForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    // Show flash messages
    React.useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.success, flash.error]);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        
        post(route('teacher.sf2.generate'), {
            onSuccess: () => {
                setIsGenerating(false);
            },
            onError: (errors) => {
                console.error('SF2 Generation Error:', errors);
                if (errors.error) {
                    toast.error(errors.error);
                } else if (errors.details) {
                    toast.error('Failed to generate SF2 report. Check console for details.');
                    console.log('Error Details:', errors.details);
                } else {
                    toast.error('Failed to generate SF2 report');
                }
                setIsGenerating(false);
            },
        });
    };

    const handleDownload = () => {
        window.open(route('teacher.sf2.download'), '_blank');
    };

    const handleExportExcel = () => {
        setIsExportingExcel(true);
        
        // Create a hidden form to submit the Excel export request
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('teacher.sf2.export-excel');
        form.style.display = 'none';
        // Remove target="_blank" to allow proper download

        // Add CSRF token from meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        // Add month and year
        const monthInput = document.createElement('input');
        monthInput.type = 'hidden';
        monthInput.name = 'month';
        monthInput.value = data.month;
        form.appendChild(monthInput);

        const yearInput = document.createElement('input');
        yearInput.type = 'hidden';
        yearInput.name = 'year';
        yearInput.value = data.year;
        form.appendChild(yearInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Show success message after a short delay
        setTimeout(() => {
            toast.success('Excel file download started!');
            setIsExportingExcel(false);
        }, 1000);
    };

    return (
        <TeacherLayout>
            <Head title="SF2 Report Generation" />

            {/* Header */}
            <div className="mb-6 bg-white p-6 rounded-lg shadow">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">SF2 Report Generation</h1>
                        <p className="text-gray-600">Generate official DepEd School Form 2 (SF2) Daily Attendance Report</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                            Report Parameters
                        </h2>

                        {/* Section and Grade Level Info */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <Users className="h-5 w-5 text-gray-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Section</p>
                                        <p className="text-lg font-semibold text-gray-900">{section?.name || 'Not Assigned'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <GraduationCap className="h-5 w-5 text-gray-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Grade Level</p>
                                        <p className="text-lg font-semibold text-gray-900">{gradeLevel?.name || 'Not Assigned'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        {flash.success && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            {flash.success}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Month and Year Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                                        Month
                                    </label>
                                    <select
                                        id="month"
                                        value={data.month}
                                        onChange={(e) => setData('month', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {months.map((month) => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.month && (
                                        <p className="mt-1 text-sm text-red-600">{errors.month}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                                        Year
                                    </label>
                                    <select
                                        id="year"
                                        value={data.year}
                                        onChange={(e) => setData('year', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.year && (
                                        <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                                    )}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing || isGenerating || !section || !gradeLevel}
                                    className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                        processing || isGenerating || !section || !gradeLevel
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Generating SF2 Report...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Generate SF2 Report (PDF)
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Excel Export Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    disabled={isExportingExcel || !section || !gradeLevel}
                                    className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                        isExportingExcel || !section || !gradeLevel
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {isExportingExcel ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Generating Excel File...
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                                            Generate SF2 Excel File
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Download Button - Show only after successful generation */}
                            {flash.success && (
                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download SF2 Report
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Information Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                            About SF2 Report
                        </h3>
                        
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">What is SF2?</h4>
                                <p>
                                    School Form 2 (SF2) is the official DepEd Daily Attendance Report of Learners. 
                                    It tracks student attendance on a monthly basis and is required for official records.
                                </p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Features:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Separate sections for Male and Female students</li>
                                    <li>Daily attendance tracking for the entire month</li>
                                    <li>LRN (Learner Reference Number) display</li>
                                    <li>Date of Birth information</li>
                                    <li>Monthly attendance totals</li>
                                    <li>Official DepEd format compliance</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Export Options:</h4>
                                <div className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                        <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-blue-800">PDF Format</p>
                                            <p className="text-xs text-gray-600">Official printable report in PDF format</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <FileSpreadsheet className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-green-800">Excel Format</p>
                                            <p className="text-xs text-gray-600">Fully editable Excel file with formulas, auto-calculations, and frozen headers</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Requirements:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Student gender must be set</li>
                                    <li>LRN and Date of Birth (optional but recommended)</li>
                                    <li>Attendance records for the selected month</li>
                                    <li>Section and Grade Level must be assigned</li>
                                </ul>
                            </div>

                            {(!section || !gradeLevel) && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-yellow-800 text-sm">
                                        <strong>Note:</strong> You need to be assigned to a section and grade level to generate SF2 reports.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
