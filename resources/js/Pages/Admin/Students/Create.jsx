import { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Create({ auth, sections = [], gradeLevels = [], guardians = [] }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        section_id: '',
        grade_level_id: '',
        card_id: '',
        guardian_ids: [],
        photo: null,
        gender: '',
        status: 'active',
    });
    const [selectedGuardians, setSelectedGuardians] = useState([]);
    const [photoPreview, setPhotoPreview] = useState(null);

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
            id: parseInt(option.value, 10),
            name: option.text,
        }));
        setSelectedGuardians(selectedOptions);
        setData('guardian_ids', selectedOptions.map(g => g.id).filter(id => !!id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo' && value) {
                formData.append('photo', value);
            } else {
                formData.append(key, value);
            }
        });
        post(route('admin.students.store'), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Add Student" />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            <h2 className="text-2xl font-semibold mb-6">Add New Student</h2>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter student's full name"
                                            required
                                        />
                                        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                                        <select
                                            value={data.section_id}
                                            onChange={e => setData('section_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Section</option>
                                            {sections.map(section => (
                                                <option key={section.id} value={section.id}>{section.name}</option>
                                            ))}
                                        </select>
                                        {errors.section_id && <p className="mt-2 text-sm text-red-600">{errors.section_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level *</label>
                                        <select
                                            value={data.grade_level_id}
                                            onChange={e => setData('grade_level_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Select Grade Level</option>
                                            {gradeLevels.map(grade => (
                                                <option key={grade.id} value={grade.id}>{grade.name}</option>
                                            ))}
                                        </select>
                                        {errors.grade_level_id && <p className="mt-2 text-sm text-red-600">{errors.grade_level_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Card ID</label>
                                        <input
                                            type="text"
                                            value={data.card_id}
                                            onChange={e => setData('card_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter card ID (optional)"
                                        />
                                        {errors.card_id && <p className="mt-2 text-sm text-red-600">{errors.card_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        {errors.status && <p className="mt-2 text-sm text-red-600">{errors.status}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                        <select
                                            value={data.gender}
                                            onChange={e => setData('gender', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        {errors.gender && <p className="mt-2 text-sm text-red-600">{errors.gender}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Guardians</label>
                                        <select
                                            multiple
                                            value={data.guardian_ids}
                                            onChange={handleGuardianChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            size="4"
                                        >
                                            {guardians.map(guardian => (
                                                <option key={guardian.id} value={guardian.id}>
                                                    {guardian.user.name} ({guardian.user.email})
                                                </option>
                                            ))}
                                        </select>
                                        {selectedGuardians.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedGuardians.map(guardian => (
                                                    <span key={guardian.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {guardian.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {errors.guardian_ids && <p className="mt-2 text-sm text-red-600">{errors.guardian_ids}</p>}
                                        <p className="mt-2 text-xs text-gray-500">Hold Ctrl (Cmd on Mac) to select multiple guardians</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {photoPreview && (
                                            <img src={photoPreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-full border" />
                                        )}
                                        {errors.photo && <p className="mt-2 text-sm text-red-600">{errors.photo}</p>}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {processing ? 'Saving...' : 'Save Student'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 