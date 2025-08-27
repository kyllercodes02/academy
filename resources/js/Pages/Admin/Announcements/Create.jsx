import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        priority: 'low',
        publish_at: '',
        expires_at: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.announcements.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Announcement" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                            Create New Announcement
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="title" value="Title" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="content" value="Content" />
                                <textarea
                                    id="content"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows="6"
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    required
                                />
                                <InputError message={errors.content} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="priority" value="Priority" />
                                <select
                                    id="priority"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.priority}
                                    onChange={e => setData('priority', e.target.value)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <InputError message={errors.priority} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="publish_at" value="Publish Date (Optional)" />
                                <TextInput
                                    id="publish_at"
                                    type="datetime-local"
                                    className="mt-1 block w-full"
                                    value={data.publish_at}
                                    onChange={e => setData('publish_at', e.target.value)}
                                />
                                <InputError message={errors.publish_at} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="expires_at" value="Expiry Date (Optional)" />
                                <TextInput
                                    id="expires_at"
                                    type="datetime-local"
                                    className="mt-1 block w-full"
                                    value={data.expires_at}
                                    onChange={e => setData('expires_at', e.target.value)}
                                />
                                <InputError message={errors.expires_at} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end">
                                <PrimaryButton
                                    className="ml-4"
                                    disabled={processing}
                                >
                                    Create Announcement
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 