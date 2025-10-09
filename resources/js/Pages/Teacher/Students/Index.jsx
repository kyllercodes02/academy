import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { debounce } from 'lodash';
import { UserPlus, Edit, X, User, Camera, Upload, ChevronDown, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Index({ students, sections, gradeLevels, guardians }) {
    const page = usePage();
    const { search = '' } = page.props;
    const [searchQuery, setSearchQuery] = useState(search);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedGuardians, setSelectedGuardians] = useState([]);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [guardianSearchQuery, setGuardianSearchQuery] = useState('');
    const [isGuardianDropdownOpen, setIsGuardianDropdownOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        lrn: '',
        date_of_birth: '',
        gender: '',
        section_id: '',
        grade_level_id: '',
        guardian_ids: [],
        photo: null,
    });

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

    const debouncedSearch = debounce((query) => {
        router.get(route('teacher.students.index'), { search: query }, { preserveState: true, preserveScroll: true, replace: true });
    }, 500);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
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
        if (editingStudent) {
            const submitData = {
                ...data,
                _method: 'PUT',
            };

            router.post(route('teacher.students.update', editingStudent.id), submitData, {
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
                if (key === 'photo' && value) {
                    formData.append('photo', value);
                } else {
                    formData.append(key, value);
                }
            });
            post(route('teacher.students.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    closeModal();
                    toast.success('Student created successfully');
                },
                onError: () => toast.error('Failed to create student'),
            });
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

    // Helper to split full name into first and last name
    const splitName = (fullName = '') => {
        const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return { firstName: '', lastName: '' };
        if (parts.length === 1) return { firstName: parts[0], lastName: '' };
        const lastName = parts[parts.length - 1];
        const firstName = parts.slice(0, -1).join(' ');
        return { firstName, lastName };
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEdit(false);
        setEditingStudent(null);
        reset();
        setSelectedGuardians([]);
        setPhotoPreview(null);
        setGuardianSearchQuery('');
        setIsGuardianDropdownOpen(false);
        clearErrors();
    };

    return (
        <TeacherLayout title="My Students">
            <Head title="My Students" />

            {/* Header */}
            <div className="mb-6 bg-white p-4 rounded shadow">
                <h1 className="text-2xl font-semibold text-gray-900">My Students</h1>
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
                <button 
                    onClick={() => openModal()} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Student
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded shadow overflow-hidden mb-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade & Section</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students?.data?.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center px-6 py-4 text-gray-500">No students found.</td>
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

            {/* Modal with Landscape Layout */}
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
        </TeacherLayout>
    );
}