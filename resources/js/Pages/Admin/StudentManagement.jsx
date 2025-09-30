import React, { useState, useEffect, useContext } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { debounce } from 'lodash';
import { CreditCard, Search, UserPlus, Edit, Trash, AlertCircle, X, User, Camera, Upload, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-hot-toast';

export default function StudentManagement({ students, sections, gradeLevels, guardians }) {
    const page = usePage();
    const { search, sectionFilter = '', gradeFilter = '' } = page.props;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
    const [isManualCardModalOpen, setIsManualCardModalOpen] = useState(false);
    const [cardId, setCardId] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [selectedGuardians, setSelectedGuardians] = useState([]);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [guardianSearchQuery, setGuardianSearchQuery] = useState('');
    const [isGuardianDropdownOpen, setIsGuardianDropdownOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importError, setImportError] = useState('');
    const [importLoading, setImportLoading] = useState(false);
    // Section selection for CSV import
    const [selectedSection, setSelectedSection] = useState(sections[0]?.id || '');
    const [showCSVUpload, setShowCSVUpload] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [csvError, setCsvError] = useState('');
    const [csvSuccess, setCsvSuccess] = useState('');
    const [csvReport, setCsvReport] = useState(null);
    const [csvLoading, setCsvLoading] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        lrn: '',
        date_of_birth: '',
        gender: '',
        section_id: '',
        grade_level_id: '',
        guardian_ids: [],
        photo: null,
    });

    const cardForm = useForm({
        student_id: '',
        card_id: '',
    });

    const [selectedSectionFilter, setSelectedSectionFilter] = useState(sectionFilter || '');
    const [selectedGradeFilter, setSelectedGradeFilter] = useState(gradeFilter || '');
    const [filteredSections, setFilteredSections] = useState(sections);

    // Initialize filtered sections based on grade filter
    useEffect(() => {
        if (selectedGradeFilter) {
            const gradeSections = sections.filter(section => section.grade_level_id == selectedGradeFilter);
            setFilteredSections(gradeSections);
        } else {
            setFilteredSections(sections);
        }
    }, [selectedGradeFilter, sections]);

    // Close guardian dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isGuardianDropdownOpen && !event.target.closest('.guardian-dropdown')) {
                setIsGuardianDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isGuardianDropdownOpen]);

    const debouncedSearch = debounce((query, sectionId, gradeId) => {
        router.get(route('admin.students.index'), { search: query, section: sectionId, grade: gradeId, page: 1 }, { preserveState: true, preserveScroll: true, replace: true });
    }, 500);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value, selectedSectionFilter, selectedGradeFilter);
    };

    const handleSectionFilterChange = (e) => {
        const newSection = e.target.value;
        setSelectedSectionFilter(newSection);
        debouncedSearch(searchQuery, newSection, selectedGradeFilter);
    };

    const handleGradeFilterChange = (e) => {
        const newGrade = e.target.value;
        setSelectedGradeFilter(newGrade);

        let nextSection = selectedSectionFilter;

        // Filter sections based on selected grade
        if (newGrade) {
            const gradeSections = sections.filter(section => String(section.grade_level_id) == String(newGrade));
            setFilteredSections(gradeSections);
            // Reset section filter if it's not valid for the new grade
            if (selectedSectionFilter && !gradeSections.find(s => String(s.id) == String(selectedSectionFilter))) {
                nextSection = '';
                setSelectedSectionFilter('');
            }
        } else {
            setFilteredSections(sections);
        }

        // Use computed nextSection to avoid passing stale state
        debouncedSearch(searchQuery, nextSection, newGrade);
    };

    const openModal = (student = null) => {
        clearErrors();
        if (student) {
            // Format date_of_birth to yyyy-MM-dd for HTML date input
            let formattedDate = '';
            if (student.date_of_birth) {
                try {
                    const date = new Date(student.date_of_birth);
                    if (!isNaN(date.getTime())) {
                        formattedDate = date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    console.warn('Could not parse date:', student.date_of_birth);
                }
            }
            
            setData({
                name: student.name || '',
                lrn: student.lrn || '',
                date_of_birth: formattedDate,
                gender: student.gender || '',
                section_id: student.section_id || '',
                grade_level_id: student.grade_level_id || '',
                guardian_ids: Array.isArray(student.guardians) ? student.guardians.map(g => g.id) : [],
                photo: null,
            });
            setSelectedGuardians(Array.isArray(student.guardians) ? student.guardians.map(g => ({ id: g.id, email: g.email })) : []);
            setPhotoPreview(student.photo_url || null);
            setEditingStudent(student);
        } else {
            reset();
            setSelectedGuardians([]);
            setPhotoPreview(null);
            setEditingStudent(null);
        }
        setGuardianSearchQuery('');
        setIsGuardianDropdownOpen(false);
        setIsModalOpen(true);
        setTimeout(() => {
            const fileInput = document.getElementById('photo');
            if (fileInput) fileInput.value = '';
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Prepare form data, only include photo if a file is selected
        if (editingStudent) {
            const submitData = {
                ...data,
                _method: 'PUT',
            };

            router.post(route('admin.students.update', editingStudent.id), submitData, {
                onSuccess: () => {
                    closeModal();
                    toast.success('Student updated successfully');
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Failed to update student');
                },
            });
        } else {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                // If the key is 'photo' and value is a File, append as file
                if (key === 'photo' && value) {
                    formData.append('photo', value);
                } else {
                    formData.append(key, value);
                }
            });
            post(route('admin.students.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    closeModal();
                    toast.success('Student created successfully');
                },
                onError: () => toast.error('Failed to create student'),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this student?')) {
            destroy(route('admin.students.destroy', id), {
                preserveScroll: true,
                preserveState: true
            });
        }
    };

    const startCardRegistration = async (student) => {
        setSelectedStudentForCard(student);
        setIsManualCardModalOpen(true);
    };

    const unregisterCard = (student) => {
        if (confirm('Are you sure you want to unregister this card?')) {
            cardForm.setData({ student_id: student.id });
            cardForm.delete(route('admin.students.unregister-card'), {
                preserveScroll: true,
            });
        }
    };

    const handleCardRegistration = async (student, autoCardId = null) => {
        const cardToRegister = autoCardId || cardId;
        
        if (!cardToRegister?.trim()) {
            setError('Please enter a card ID');
            return;
        }

        try {
            setError('');
            setIsRegistering(true);
            setStatus('Registering card...');

            // Standardize card ID format (trim and lowercase)
            const standardizedCardId = cardToRegister.trim().toLowerCase();

            const response = await axios.post(route('admin.students.register-card', { student: student.id }), {
                card_id: standardizedCardId
            });

            if (response.data.status === 'success') {
                setStatus('✓ Card registered successfully');
                setCardId('');
                
                // Play a success sound
                const audio = new Audio('/sounds/success.mp3');
                audio.play();
                
                setTimeout(() => {
                    setIsManualCardModalOpen(false);
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to register card');
            // Play an error sound
            const audio = new Audio('/sounds/error.mp3');
            audio.play();
        } finally {
            setIsRegistering(false);
        }
    };

    const handleUnregisterCard = async (student) => {
        if (!confirm('Are you sure you want to unregister this card?')) return;

        try {
            const response = await axios.delete(route('admin.students.unregister-card', { student: student.id }));
            if (response.data.status === 'success') {
                window.location.reload();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to unregister card');
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onload = (e) => setPhotoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleGuardianChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => ({
            id: parseInt(option.value, 10), // user id
            email: option.text,
        }));
        setSelectedGuardians(selectedOptions);
        setData('guardian_ids', selectedOptions.map(g => g.id).filter(id => !!id));
    };

    const handleGuardianSelect = (guardian) => {
        const guardianData = {
            id: guardian.user.id,
            email: guardian.user.email,
            name: guardian.user.name
        };
        
        // Check if guardian is already selected
        if (!selectedGuardians.find(g => g.id === guardianData.id)) {
            const newSelectedGuardians = [...selectedGuardians, guardianData];
            setSelectedGuardians(newSelectedGuardians);
            setData('guardian_ids', newSelectedGuardians.map(g => g.id));
        }
        
        setGuardianSearchQuery('');
        setIsGuardianDropdownOpen(false);
    };

    const handleGuardianRemove = (guardianId) => {
        const newSelectedGuardians = selectedGuardians.filter(g => g.id !== guardianId);
        setSelectedGuardians(newSelectedGuardians);
        setData('guardian_ids', newSelectedGuardians.map(g => g.id));
    };

    const filteredGuardians = guardians.filter(guardian => {
        const searchLower = guardianSearchQuery.toLowerCase();
        const nameMatch = guardian.user.name.toLowerCase().includes(searchLower);
        const emailMatch = guardian.user.email.toLowerCase().includes(searchLower);
        const isAlreadySelected = selectedGuardians.find(g => g.id === guardian.user.id);
        
        return (nameMatch || emailMatch) && !isAlreadySelected;
    });

    const getSectionLabel = (name = '') => {
        const match = String(name).match(/([A-E])$/i);
        return match ? match[1].toUpperCase() : name;
    };

    const handleImportFileChange = (e) => {
        const file = e.target.files[0];
        if (file && !file.name.endsWith('.xlsx')) {
            setImportFile(null);
            setImportError('Only Excel (.xlsx) files are supported.');
            return;
        }
        setImportFile(file);
        setImportError('');
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) {
            setImportError('Please select an Excel (.xlsx) file.');
            return;
        }
        setImportLoading(true);
        setImportError('');
        const formData = new FormData();
        formData.append('file', importFile);
        try {
            await axios.post(route('admin.students.import'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setIsImportModalOpen(false);
            setImportFile(null);
            toast.success('Students imported successfully');
            window.location.reload();
        } catch (error) {
            setImportError(error.response?.data?.errors?.file?.[0] || error.response?.data?.message || 'Failed to import students');
        } finally {
            setImportLoading(false);
        }
    };

    // Helper to split full name into first and last name without backend changes
    const splitName = (fullName = '') => {
        const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return { firstName: '', lastName: '' };
        if (parts.length === 1) return { firstName: parts[0], lastName: '' };
        const lastName = parts[parts.length - 1];
        const firstName = parts.slice(0, -1).join(' ');
        return { firstName, lastName };
    };

    // Card Registration Modal
    const CardRegistrationModal = ({ student, onClose }) => {
        const [isListening, setIsListening] = useState(false);
        const [lastInputTime, setLastInputTime] = useState(0);
        const [inputBuffer, setInputBuffer] = useState('');

        // Add event listener for input changes to detect NFC input
        useEffect(() => {
            const cardInput = document.getElementById('cardId');
            if (cardInput) {
                const handleInput = (e) => {
                    const currentTime = Date.now();
                    const timeDiff = currentTime - lastInputTime;
                    
                    // If typing is very fast (like from NFC) or we have accumulated some input
                    if (timeDiff < 50 || inputBuffer) {
                        setInputBuffer(prev => prev + e.target.value);
                        // Reset the input field immediately
                        setCardId('');
                        
                        // If we haven't received input for 100ms, consider it complete
                        setTimeout(() => {
                            if (Date.now() - lastInputTime >= 100) {
                                handleCardRegistration(student, inputBuffer);
                                setInputBuffer('');
                            }
                        }, 100);
                    } else {
                        // Manual typing - update the card ID normally
                        setCardId(e.target.value);
                    }
                    
                    setLastInputTime(currentTime);
                };
                
                cardInput.addEventListener('input', handleInput);
                setIsListening(true);
                
                return () => {
                    cardInput.removeEventListener('input', handleInput);
                    setIsListening(false);
                };
            }
        }, [student]);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Register Card for {student.name}
                        </h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                            disabled={isRegistering}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="cardId" className="block text-sm font-medium text-gray-700">
                                Card ID {isListening && <span className="text-green-600 ml-2">(Ready for NFC input)</span>}
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard className={`h-5 w-5 ${isListening ? 'text-green-500' : 'text-gray-400'}`} />
                                </div>
                                <input
                                    type="text"
                                    id="cardId"
                                    value={cardId}
                                    onChange={(e) => setCardId(e.target.value)}
                                    className={`block w-full pl-10 pr-3 py-2 border ${
                                        isListening ? 'border-green-300' : 'border-gray-300'
                                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                    placeholder={isListening ? "Tap NFC card or enter ID manually" : "Enter card ID"}
                                    disabled={isRegistering}
                                    autoFocus
                                />
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                {isListening 
                                    ? "The system will automatically detect when an NFC card is tapped"
                                    : "Enter the card ID manually"
                                }
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <span className="text-red-800 text-sm">{error}</span>
                                </div>
                            </div>
                        )}

                        {status && (
                            <div className={`rounded-md p-3 ${
                                status.includes('✓') ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'
                            }`}>
                                {status}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={isRegistering}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleCardRegistration(student)}
                                disabled={isRegistering}
                                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                    isRegistering
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                            >
                                {isRegistering ? 'Registering...' : 'Register Card'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setEditingStudent(null);
        setPreviewUrl(null);
        reset();
        setSelectedGuardians([]);
        setPhotoPreview(null);
        setGuardianSearchQuery('');
        setIsGuardianDropdownOpen(false);
        clearErrors();
    };

    return (
        <AdminLayout title="Student Management">
            <Head title="Student Management" />

            {/* Header */}
            <div className="mb-6 bg-white p-4 rounded shadow">
                <h1 className="text-2xl font-semibold text-gray-900">Student Management</h1>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-3 items-center mb-4 bg-white p-4 rounded shadow">
                <div className="relative w-64">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Search Students"
                        className="border border-gray-300 p-2 pl-8 rounded w-full"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                {/* Grade Filter */}
                <div>
                    <select
                        value={selectedGradeFilter}
                        onChange={handleGradeFilterChange}
                        className="border border-gray-300 p-2 rounded w-32"
                    >
                        <option value="">Grades</option>
                        {gradeLevels.map(grade => (
                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                    </select>
                </div>
                {/* Section Filter */}
                <div>
                    <select
                        value={selectedSectionFilter}
                        onChange={handleSectionFilterChange}
                        className="border border-gray-300 p-2 rounded w-32"
                    >
                        <option value="">Sections</option>
                        {filteredSections.map(section => (
                            <option key={section.id} value={section.id}>{section.name}</option>
                        ))}
                    </select>
                </div>
                <button 
                    onClick={() => openModal()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Student
                </button>
                <button
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => setShowCSVUpload(!showCSVUpload)}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    {showCSVUpload ? 'Hide CSV Upload' : 'Import Students (CSV)'}
                </button>
                
            </div>

            {/* CSV Upload Form */}
            {showCSVUpload && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold mb-4">Upload CSV File</h3>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">CSV columns: name, lrn, date_of_birth (YYYY-MM-DD), gender, section_id, grade_level_id, guardian_emails (optional), card_id (optional)</p>
                        <p className="text-sm text-gray-500">Use the template for correct headers.</p>
                    </div>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setCsvError('');
                        setCsvSuccess('');
                        if (!csvFile) {
                            setCsvError('Please select a CSV file.');
                            return;
                        }
                        setCsvLoading(true);
                        const formData = new FormData();
                        formData.append('csv_file', csvFile);
                        try {
                            const resp = await axios.post(route('admin.students.upload-csv'), formData, {
                                headers: { 'Content-Type': 'multipart/form-data' },
                            });
                            const data = resp?.data || {};
                            setCsvReport(data);
                            setCsvSuccess(`Processed: created ${data.created || 0}, updated ${data.updated || 0}${(data.errors?.length||0)>0 ? `, errors ${data.errors.length}`: ''}`);
                            setCsvFile(null);
                            // Refresh list via Inertia without full reload
                            router.get(route('admin.students.index'), {}, { preserveScroll: true, preserveState: true, replace: true });
                        } catch (e) {
                            const errs = e.response?.data?.errors || e.response?.data?.message || 'Failed to upload CSV.';
                            setCsvError(typeof errs === 'string' ? errs : JSON.stringify(errs));
                        } finally {
                            setCsvLoading(false);
                        }
                    }}>
                        <div className="mb-4">
                            <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={e => setCsvFile(e.target.files[0])}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            />
                        </div>
                        {csvSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded p-3 mb-3 text-green-800">
                                {csvSuccess}
                            </div>
                        )}
                        {csvError && <div className="text-red-600 mb-4">{csvError}</div>}
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                            disabled={csvLoading}
                        >
                            {csvLoading ? 'Uploading...' : 'Upload CSV'}
                        </button>
                    </form>
                    {csvReport?.errors && csvReport.errors.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Rows with errors ({csvReport.errors.length}):</h4>
                            <div className="max-h-64 overflow-auto border rounded">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="text-left p-2">Row</th>
                                            <th className="text-left p-2">Messages</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {csvReport.errors.map((err, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-2">{err.row}</td>
                                                <td className="p-2">
                                                    <ul className="list-disc ml-5">
                                                        {(err.messages || []).map((m, i) => (
                                                            <li key={i}>{m}</li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded shadow overflow-hidden mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade & Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NFC Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students?.data?.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center px-6 py-4 text-gray-500">No students found.</td>
                            </tr>
                        ) : (
                            students?.data?.map((student) => {
                                const { firstName, lastName } = splitName(student.name);
                                return (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{firstName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.guardian_emails}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.grade_level?.name || student.grade_level || 'N/A'} - {student.section?.name || student.student_section || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.card_id ? (
                                            <div className="flex items-center space-x-2">
                                                <CreditCard className="h-4 w-4 text-green-600" />
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Registered
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Unregistered
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-4">
                                            {/* Edit */}
                                            <button
                                                onClick={() => openModal(student)}
                                                title="Edit"
                                                aria-label={`Edit ${student.name}`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            {/* Card status: green when registered, red when unregistered */}
                                            <button
                                                onClick={() => {
                                                    if (student.card_id) {
                                                        handleUnregisterCard(student);
                                                    } else {
                                                        setSelectedStudentForCard(student);
                                                        setIsManualCardModalOpen(true);
                                                    }
                                                }}
                                                title={student.card_id ? 'Unregister Card' : 'Register Card'}
                                                aria-label={`${student.card_id ? 'Unregister' : 'Register'} card for ${student.name}`}
                                                className={`${student.card_id ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                                            >
                                                <CreditCard className="h-5 w-5" />
                                            </button>
                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(student.id)}
                                                title="Delete"
                                                aria-label={`Delete ${student.name}`}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-center">
                {students?.links && students.links.length > 0 && (
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {students.links.map((link, index) => (
                            <button
                                key={index}
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) router.visit(link.url, { preserveScroll: true, preserveState: true });
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    link.active 
                                        ? 'z-10 bg-blue-600 border-blue-600 text-white' 
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                            />
                        ))}
                    </nav>
                )}
            </div>

            {/* Flash Messages */}
            {page.props.flash?.success && (
                <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow" role="alert">
                    <p className="font-medium">Success!</p>
                    <p>{page.props.flash.success}</p>
                </div>
            )}

            {/* Improved Modal with Landscape Layout */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            {editingStudent ? 'Edit Student' : 'Add New Student'}
                                        </h2>
                                        <p className="text-blue-100 text-sm">
                                            {editingStudent ? 'Update student information' : 'Fill in the details to create a new student record'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={closeModal}
                                    className="text-white hover:text-blue-200 transition-colors duration-200 p-1 rounded-lg hover:bg-white hover:bg-opacity-10"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Two Column Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column - Photo Section */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <Camera className="h-5 w-5 mr-2 text-gray-600" />
                                                Student Photo
                                            </h3>
                                            
                                            <div className="flex flex-col items-center space-y-4">
                                                {/* Photo Preview */}
                                                <div className="relative">
                                                    {photoPreview ? (
                                                        <img
                                                            src={photoPreview}
                                                            alt="Student Preview"
                                                            className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                                                        />
                                                    ) : (
                                                        <div className="h-32 w-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                                                            <User className="h-12 w-12 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Upload Button */}
                                                <div className="w-full">
                                                    <label htmlFor="photo" className="relative cursor-pointer">
                                                        <div className="flex items-center justify-center w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                                                            <Upload className="h-5 w-5 text-gray-400 mr-2" />
                                                            <span className="text-sm font-medium text-gray-600">
                                                                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="file"
                                                            id="photo"
                                                            accept="image/*"
                                                            onChange={handlePhotoChange}
                                                            className="sr-only"
                                                        />
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                                        PNG, JPG up to 2MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Columns - Form Fields */}
                                    <div className="lg:col-span-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Student Name */}
                                            <div className="md:col-span-2">
                                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                    placeholder="Enter student's full name"
                                                    required
                                                />
                                                {errors.name && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* LRN */}
                                            <div>
                                                <label htmlFor="lrn" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    LRN
                                                </label>
                                                <input
                                                    type="text"
                                                    id="lrn"
                                                    value={data.lrn}
                                                    onChange={e => setData('lrn', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                    placeholder="Enter student's LRN"
                                                />
                                                {errors.lrn && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.lrn}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Date of Birth */}
                                            <div>
                                                <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Date of Birth
                                                </label>
                                                <input
                                                    type="date"
                                                    id="date_of_birth"
                                                    value={data.date_of_birth}
                                                    onChange={e => setData('date_of_birth', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                />
                                                {errors.date_of_birth && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.date_of_birth}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Gender */}
                                            <div>
                                                <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Gender
                                                </label>
                                                <select
                                                    id="gender"
                                                    value={data.gender}
                                                    onChange={e => setData('gender', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                                {errors.gender && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.gender}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Section */}
                                            <div>
                                                <label htmlFor="section_id" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Section *
                                                </label>
                                                <select
                                                    id="section_id"
                                                    value={data.section_id}
                                                    onChange={e => setData('section_id', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                    required
                                                >
                                                    <option value="">Select Section</option>
                                                    {sections.map(section => (
                                                        <option key={section.id} value={section.id}>
                                                            {getSectionLabel(section.name)}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.section_id && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.section_id}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Grade Level */}
                                            <div>
                                                <label htmlFor="grade_level_id" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Grade Level *
                                                </label>
                                                <select
                                                    id="grade_level_id"
                                                    value={data.grade_level_id}
                                                    onChange={e => setData('grade_level_id', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                    required
                                                >
                                                    <option value="">Select Grade Level</option>
                                                    {gradeLevels.map(grade => (
                                                        <option key={grade.id} value={grade.id}>
                                                            {grade.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.grade_level_id && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.grade_level_id}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Guardians */}
                                            <div className="md:col-span-2">
                                                <label htmlFor="guardian_search" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Guardians
                                                </label>
                                                
                                                {/* Searchable Guardian Dropdown */}
                                                <div className="relative guardian-dropdown">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            id="guardian_search"
                                                            value={guardianSearchQuery}
                                                            onChange={(e) => {
                                                                setGuardianSearchQuery(e.target.value);
                                                                setIsGuardianDropdownOpen(true);
                                                            }}
                                                            onFocus={() => setIsGuardianDropdownOpen(true)}
                                                            placeholder="Search guardians by name or email..."
                                                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                                        />
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Dropdown Options */}
                                                    {isGuardianDropdownOpen && (
                                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                                            {filteredGuardians.length > 0 ? (
                                                                filteredGuardians.map(guardian => (
                                                                    <div
                                                                        key={guardian.id}
                                                                        onClick={() => handleGuardianSelect(guardian)}
                                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                    >
                                                                        <div className="font-medium text-gray-900">{guardian.user.name}</div>
                                                                        <div className="text-sm text-gray-500">{guardian.user.email}</div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="px-4 py-3 text-gray-500 text-center">
                                                                    {guardianSearchQuery ? 'No guardians found' : 'Start typing to search guardians'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Selected Guardians */}
                                                {selectedGuardians.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-sm text-gray-600 mb-2">Selected Guardians:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedGuardians.map(guardian => (
                                                                <span
                                                                    key={guardian.id}
                                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                                >
                                                                    {guardian.name || guardian.email}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleGuardianRemove(guardian.id)}
                                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {errors.guardian_ids && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        {errors.guardian_ids}
                                                    </p>
                                                )}
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Type to search and select guardians
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                                            processing
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {editingStudent ? 'Updating...' : 'Creating...'}
                                            </div>
                                        ) : (
                                            <>
                                                {editingStudent ? 'Update Student' : 'Create Student'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Card Registration Modal */}
            {isManualCardModalOpen && selectedStudentForCard && (
                <CardRegistrationModal
                    student={selectedStudentForCard}
                    onClose={() => {
                        setIsManualCardModalOpen(false);
                        setSelectedStudentForCard(null);
                        setCardId('');
                        setError('');
                        setStatus('');
                    }}
                />
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <Dialog open={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 z-20 w-full max-w-md">
                            <Dialog.Title className="text-lg font-bold mb-2">Import Students from Excel</Dialog.Title>
                            <form onSubmit={handleImportSubmit}>
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    onChange={handleImportFileChange}
                                    className="mb-2"
                                />
                                {importError && <div className="text-red-600 mb-2">{importError}</div>}
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                        onClick={() => setIsImportModalOpen(false)}
                                        disabled={importLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        disabled={importLoading}
                                    >
                                        {importLoading ? 'Importing...' : 'Import'}
                                    </button>
                                </div>
                            </form>
                            <div className="mt-4 text-sm text-gray-500">
                                <b>Excel columns required:</b> name, section, grade_level, card_id (optional)
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </AdminLayout>
    );
}