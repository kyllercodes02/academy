import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';

export default function UserManagement({ auth, users, search }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        // Fixed to admin for this section
        role: 'admin',
        search: search || '',
    });

    const openCreateModal = () => {
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            // Keep admin-only management
            role: 'admin',
            search: data.search,
        });
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setEditingUser(null);
        reset();
    };

    const handleSearch = (e) => {
        setData('search', e.target.value);
    };

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('admin.users.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUser) {
            put(route('admin.users.update', editingUser.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (user) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="User Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">User Management</h2>
                                <PrimaryButton onClick={openCreateModal}>
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add New User
                                </PrimaryButton>
                            </div>

                            <div className="mb-4">
                                <form onSubmit={submitSearch}>
                                    <TextInput
                                        type="text"
                                        placeholder="Search users..."
                                        value={data.search}
                                        onChange={handleSearch}
                                        className="w-full sm:w-1/3"
                                    />
                                </form>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-2 text-left">Name</th>
                                            <th className="px-4 py-2 text-left">Email</th>
                                            <th className="px-4 py-2 text-left">Role</th>
                                            <th className="px-4 py-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.data.map((user) => (
                                            <tr key={user.id} className="border-t">
                                                <td className="px-4 py-2">{user.name}</td>
                                                <td className="px-4 py-2">{user.email}</td>
                                                <td className="px-4 py-2 capitalize">{user.role}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <SecondaryButton
                                                        onClick={() => openEditModal(user)}
                                                        className="mr-2"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </SecondaryButton>
                                                    <SecondaryButton
                                                        onClick={() => handleDelete(user)}
                                                        className="bg-red-100 hover:bg-red-200 text-red-600"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </SecondaryButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isCreateModalOpen || editingUser} onClose={closeModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {editingUser ? 'Edit User' : 'Create New User'}
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* Role is fixed to Admin in this section */}
                    <div className="mt-6">
                        <InputLabel htmlFor="role" value="Role" />
                        <TextInput
                            id="role"
                            type="text"
                            className="mt-1 block w-full bg-gray-50"
                            value={data.role}
                            readOnly
                        />
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            className="mt-1 block w-full"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required={!editingUser}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            className="mt-1 block w-full"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required={!editingUser}
                        />
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingUser ? 'Update' : 'Create'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
} 