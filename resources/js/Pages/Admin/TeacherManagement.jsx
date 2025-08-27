import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

export default function TeacherManagement({ teachers = [], sections = [], gradeLevels = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        section_id: '',
        grade_level_id: '',
    });

    const openModal = (teacher = null) => {
        if (teacher) {
            const assignment = teacher.teacherAssignments && teacher.teacherAssignments[0];
            setData({
                name: teacher.name || '',
                email: teacher.email || '',
                password: '',
                section_id: assignment?.section_id || '',
                grade_level_id: assignment?.grade_level_id || '',
            });
            setEditingTeacher(teacher);
        } else {
            reset();
            setEditingTeacher(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingTeacher(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTeacher) {
            put(route('admin.teachers.update', editingTeacher.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.teachers.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (teacherId) => {
        if (confirm('Are you sure you want to delete this teacher?')) {
            router.delete(route('admin.teachers.destroy', teacherId));
        }
    };

    return (
        <AdminLayout>
            <Head title="Teacher Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Teachers</h2>
                                <button
                                    onClick={() => openModal()}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    Add Teacher
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Section
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Grade Level
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {teachers.map((teacher) => {
                                            const assignment = teacher.teacherAssignments?.[0];
                                            return (
                                                <tr key={teacher.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {teacher.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {teacher.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {assignment?.section?.name || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {assignment?.gradeLevel?.name || '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => openModal(teacher)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                                        >
                                                            <Pencil className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(teacher.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {isModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <div className="bg-white p-8 rounded-lg w-full max-w-md">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                                        </h3>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                />
                                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                />
                                                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                                <input
                                                    type="password"
                                                    value={data.password}
                                                    onChange={e => setData('password', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                    placeholder={editingTeacher ? '(Leave blank to keep current)' : ''}
                                                />
                                                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">Section</label>
                                                <select
                                                    value={data.section_id}
                                                    onChange={e => setData('section_id', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                >
                                                    <option value="">Select a section</option>
                                                    {sections.map(section => (
                                                        <option key={section.id} value={section.id}>
                                                            {section.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.section_id && <div className="text-red-500 text-sm mt-1">{errors.section_id}</div>}
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">Grade Level</label>
                                                <select
                                                    value={data.grade_level_id}
                                                    onChange={e => setData('grade_level_id', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                                >
                                                    <option value="">Select a grade level</option>
                                                    {gradeLevels.map(gradeLevel => (
                                                        <option key={gradeLevel.id} value={gradeLevel.id}>
                                                            {gradeLevel.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.grade_level_id && <div className="text-red-500 text-sm mt-1">{errors.grade_level_id}</div>}
                                            </div>

                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                                >
                                                    {processing ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}