import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        contact_number: '',
        relationship: 'parent',
        address: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.guardians.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Guardian" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="contact_number" value="Contact Number" />
                                    <TextInput
                                        id="contact_number"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.contact_number}
                                        onChange={e => setData('contact_number', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.contact_number} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="relationship" value="Relationship" />
                                    <select
                                        id="relationship"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.relationship}
                                        onChange={e => setData('relationship', e.target.value)}
                                        required
                                    >
                                        <option value="parent">Parent</option>
                                        <option value="guardian">Guardian</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <InputError message={errors.relationship} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="address" value="Address" />
                                    <textarea
                                        id="address"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows="3"
                                        required
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="emergency_contact_name" value="Emergency Contact Name" />
                                    <TextInput
                                        id="emergency_contact_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.emergency_contact_name}
                                        onChange={e => setData('emergency_contact_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.emergency_contact_name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="emergency_contact_number" value="Emergency Contact Number" />
                                    <TextInput
                                        id="emergency_contact_number"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.emergency_contact_number}
                                        onChange={e => setData('emergency_contact_number', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.emergency_contact_number} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-4">
                                    <SecondaryButton
                                        href={route('admin.guardians.index')}
                                        className="mr-4"
                                    >
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton disabled={processing}>
                                        Create Guardian
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 