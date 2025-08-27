import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { debounce } from 'lodash';
import { CreditCard, X, User, Edit, Trash, MoreVertical } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';

const Index = () => {
    // Destructure sections and gradeLevels from usePage().props
    const { students, search, sections = [], gradeLevels = [] } = usePage().props;
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [isReadingCard, setIsReadingCard] = useState(false);
    const [selectedStudentForCard, setSelectedStudentForCard] = useState(null);
    const [isManualCardModalOpen, setIsManualCardModalOpen] = useState(false);
    const [selectedStudentForManualCard, setSelectedStudentForManualCard] = useState(null);

    const form = useForm({
        name: '',
        student_id: '',
        guardian_email: '',
        student_section: '',
        grade_level: '',
        status: 'active',
        card_id: '',
    });

    const cardForm = useForm({
        student_id: '',
        card_id: '',
    });

    const debouncedSearch = debounce((query) => {
        router.get(route('admin.students.index'), { search: query }, { preserveState: true, preserveScroll: true });
    }, 500);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
    };

    const openAddModal = () => {
        form.reset();
        setIsEdit(false);
        setIsModalOpen(true);
    };

    const openEditModal = (student) => {
        setIsEdit(true);
        setEditStudent(student);
        form.setData({
            name: student.name,
            student_id: student.student_id || '',
            guardian_email: student.guardian_email,
            student_section: student.student_section,
            grade_level: student.grade_level || '',
            status: student.status,
            card_id: student.card_id,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        // Map section and grade level names to IDs
        const selectedSection = sections.find(s => s.name === form.data.student_section);
        const selectedGrade = gradeLevels.find(g => g.name === form.data.grade_level);
        const payload = {
            name: form.data.name,
            student_id: form.data.student_id,
            guardian_email: form.data.guardian_email,
            section_id: selectedSection ? selectedSection.id : '',
            grade_level_id: selectedGrade ? selectedGrade.id : '',
            status: form.data.status,
            card_id: form.data.card_id,
        };
        if (isEdit && editStudent) {
            form.put(route('admin.students.update', editStudent.id), {
                ...payload,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        } else {
            form.post(route('admin.students.store'), {
                ...payload,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this student?')) {
            form.delete(route('admin.students.destroy', id), {
                preserveScroll: true,
                preserveState: true
            });
        }
    };

    const startCardRegistration = async (student) => {
        // Check if running on HTTPS or localhost
        const isSecureContext = window.isSecureContext;
        if (!isSecureContext) {
            setSelectedStudentForManualCard(student);
            setIsManualCardModalOpen(true);
            return;
        }

        // Check for NFC support
        if (!('NDEFReader' in window)) {
            setSelectedStudentForManualCard(student);
            setIsManualCardModalOpen(true);
            return;
        }

        try {
            setSelectedStudentForCard(student);
            setIsReadingCard(true);
            const ndef = new window.NDEFReader();
            
            try {
                await ndef.scan();
                console.log('NFC scan started...');
            } catch (error) {
                console.error('NFC Error:', error);
                if (error.name === 'NotAllowedError') {
                    alert('Please grant NFC permission to use this feature');
                } else if (error.name === 'NotReadableError') {
                    alert('Cannot read NFC. Please make sure NFC is enabled on your device');
                } else {
                    alert('Error accessing NFC: ' + error.message);
                }
                setIsReadingCard(false);
                setSelectedStudentForCard(null);
                // Fallback to manual input
                setSelectedStudentForManualCard(student);
                setIsManualCardModalOpen(true);
                return;
            }
            
            ndef.addEventListener("reading", ({ serialNumber }) => {
                console.log('Card detected:', serialNumber);
                // Set the form data
                cardForm.setData({
                    card_id: serialNumber,
                });

                // Submit the form using Inertia
                cardForm.post(route('admin.students.register-card', student.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsReadingCard(false);
                        setSelectedStudentForCard(null);
                        alert('Card registered successfully!');
                    },
                    onError: (errors) => {
                        console.error('Registration Error:', errors);
                        setIsReadingCard(false);
                        setSelectedStudentForCard(null);
                        if (errors.card_id) {
                            alert(errors.card_id);
                        } else {
                            alert('Failed to register card. This card might already be registered to another student.');
                        }
                    },
                });
            });

        } catch (error) {
            console.error('NFC Init Error:', error);
            alert('Error initializing NFC: ' + error.message);
            setIsReadingCard(false);
            setSelectedStudentForCard(null);
            // Fallback to manual input
            setSelectedStudentForManualCard(student);
            setIsManualCardModalOpen(true);
        }
    };

    const unregisterCard = (student) => {
        if (confirm('Are you sure you want to unregister this card?')) {
            cardForm.delete(route('admin.students.unregister-card', { student: student.id }), {
                preserveScroll: true,
            });
        }
    };

    const handleManualCardRegistration = (e) => {
        e.preventDefault();
        
        if (!cardForm.data.card_id?.trim()) {
            alert('Please enter a card ID');
            return;
        }

        // Ensure student_id is set
        if (!selectedStudentForManualCard?.id) {
            alert('No student selected');
            return;
        }

        // Set the form data again to ensure both fields are present
        cardForm.setData({
            card_id: cardForm.data.card_id.trim()
        });

        console.log('Submitting card registration:', cardForm.data);

        cardForm.post(route('admin.students.register-card', selectedStudentForManualCard.id), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Card registration successful');
                setIsManualCardModalOpen(false);
                setSelectedStudentForManualCard(null);
                cardForm.reset();
                alert('Card registered successfully!');
            },
            onError: (errors) => {
                console.error('Card registration failed:', errors);
                if (errors.card_id) {
                    alert(errors.card_id);
                } else if (errors.student_id) {
                    alert(errors.student_id);
                } else {
                    alert('Failed to register card. This card might already be registered to another student.');
                }
            },
        });
    };

    return (
        <AdminLayout title="Student Management">
            <Head title="Student Management" />

            {/* Header */}
            <div className="mb-6 bg-white p-4 rounded shadow">
                <h1 className="text-2xl font-semibold text-gray-900">Student Management</h1>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded shadow">
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
                    onClick={openAddModal} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Student
                </button>
            </div>

            {/* Student Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {students?.data?.length === 0 ? (
                    <div className="col-span-full text-center py-10">
                        <p className="text-gray-500">No students found.</p>
                    </div>
                ) : (
                    students?.data?.map((student) => (
                        <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
                            <div className="p-5">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={student.photo_url ? student.photo_url : `/images/default-avatar.png`}
                                        alt={student.name}
                                        className="h-20 w-20 rounded-full object-cover border-4 border-gray-200"
                                        onError={(e) => { e.target.onerror = null; e.target.src='/images/default-avatar.png'; }}
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 truncate">{student.name}</h3>
                                        <p className="text-sm text-gray-500">{student.grade_level || 'N/A'} - {student.student_section}</p>
                                        <span
                                            className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${student.status === 'active' ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 8 8">
                                                <circle cx="4" cy="4" r="3" />
                                            </svg>
                                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span className="font-semibold">Card ID:</span>
                                        {student.card_id ? (
                                            <span className="flex items-center font-mono bg-gray-100 px-2 py-1 rounded">
                                                <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                                                {student.card_id}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => startCardRegistration(student)}
                                                className={`text-green-600 hover:text-green-900 ${
                                                    isReadingCard && selectedStudentForCard?.id === student.id
                                                        ? 'animate-pulse'
                                                        : ''
                                                }`}
                                                disabled={isReadingCard}
                                            >
                                                {isReadingCard && selectedStudentForCard?.id === student.id
                                                    ? 'Waiting...'
                                                    : 'Register Card'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                                        <span className="font-semibold">Guardian:</span>
                                        <span className="truncate">{student.guardian_email || 'Not assigned'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 flex items-center justify-end">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold focus:outline-none">
                                            Actions
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content align="right" width="48" className="flex flex-col gap-1">
                                        <button
                                            onClick={() => openEditModal(student)}
                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                                        >
                                            <Edit className="mr-2 h-4 w-4 text-gray-500" />
                                            Edit
                                        </button>
                                        {student.card_id ? (
                                            <button
                                                onClick={() => unregisterCard(student)}
                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                                            >
                                                <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                                                Unregister Card
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startCardRegistration(student)}
                                                className={`w-full flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-100 focus:outline-none ${
                                                    isReadingCard && selectedStudentForCard?.id === student.id ? 'animate-pulse' : ''
                                                }`}
                                                disabled={isReadingCard}
                                            >
                                                <CreditCard className="mr-2 h-4 w-4 text-gray-500" />
                                                {isReadingCard && selectedStudentForCard?.id === student.id ? 'Waiting...' : 'Register Card'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100 focus:outline-none"
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                        </button>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="mt-6">
                {students?.links && students.links.length > 1 && (
                    <div className="flex justify-center space-x-1">
                        {students.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors duration-200 ${
                                    link.active
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : link.url
                                            ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                disabled={!link.url}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Flash Messages */}
            {usePage().props.flash?.success && (
                <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow" role="alert">
                    <p className="font-medium">Success!</p>
                    <p>{usePage().props.flash.success}</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">{isEdit ? 'Edit Student' : 'Add Student'}</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input 
                                    type="text" 
                                    value={form.data.name} 
                                    onChange={(e) => form.setData('name', e.target.value)} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Enter student name"
                                />
                                {form.errors.name && <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                                <input 
                                    type="text" 
                                    value={form.data.student_id} 
                                    onChange={(e) => form.setData('student_id', e.target.value)} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Enter student ID"
                                    required
                                />
                                {form.errors.student_id && <p className="mt-1 text-sm text-red-600">{form.errors.student_id}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Email</label>
                                <input 
                                    type="email" 
                                    value={form.data.guardian_email} 
                                    onChange={(e) => form.setData('guardian_email', e.target.value)} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="guardian@example.com"
                                />
                                {form.errors.guardian_email && <p className="mt-1 text-sm text-red-600">{form.errors.guardian_email}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Student Section</label>
                                <select 
                                    value={form.data.student_section} 
                                    onChange={(e) => form.setData('student_section', e.target.value)} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a Section</option>
                                    {sections.map((section) => (
                                        <option key={section.id} value={section.name}>{section.name}</option>
                                    ))}
                                </select>
                                {form.errors.student_section && <p className="mt-1 text-sm text-red-600">{form.errors.student_section}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                                <select 
                                    value={form.data.grade_level} 
                                    onChange={(e) => form.setData('grade_level', e.target.value)} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a Grade Level</option>
                                    {gradeLevels.map((grade) => (
                                        <option key={grade.id} value={grade.name}>{grade.name}</option>
                                    ))}
                                </select>
                                {form.errors.grade_level && <p className="mt-1 text-sm text-red-600">{form.errors.grade_level}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select 
                                    value={form.data.status} 
                                    onChange={(e) => form.setData('status', e.target.value)} 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {form.errors.status && <p className="mt-1 text-sm text-red-600">{form.errors.status}</p>}
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={form.processing}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                >
                                    {form.processing ? 'Processing...' : (isEdit ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manual Card Registration Modal */}
            {isManualCardModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Manual Card Registration</h2>
                            <button 
                                onClick={() => {
                                    setIsManualCardModalOpen(false);
                                    setSelectedStudentForManualCard(null);
                                    cardForm.reset();
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleManualCardRegistration}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Student
                                </label>
                                <div className="text-gray-900">
                                    {selectedStudentForManualCard?.name}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Card ID
                                </label>
                                <input 
                                    type="text"
                                    value={cardForm.data.card_id || ''}
                                    onChange={(e) => {
                                        cardForm.setData({
                                            student_id: selectedStudentForManualCard?.id,
                                            card_id: e.target.value
                                        });
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter card ID"
                                />
                                {cardForm.errors.card_id && (
                                    <p className="mt-1 text-sm text-red-600">{cardForm.errors.card_id}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsManualCardModalOpen(false);
                                        setSelectedStudentForManualCard(null);
                                        cardForm.reset();
                                    }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={cardForm.processing}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                >
                                    {cardForm.processing ? 'Registering...' : 'Register Card'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Index; 