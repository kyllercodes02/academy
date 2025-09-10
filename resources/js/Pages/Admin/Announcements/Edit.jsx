import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';

export default function Edit({ announcement }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || 'low',
        is_active: announcement.is_active ?? true,
        publish_at: announcement.publish_at ? announcement.publish_at : '',
        expires_at: announcement.expires_at ? announcement.expires_at : '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.announcements.update', announcement.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Announcement" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-semibold text-gray-900">Edit Announcement</h1>
                            <Link
                                href={route('admin.announcements.index')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Back to list
                            </Link>
                        </div>

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
                                <SelectInput
                                    id="priority"
                                    className="mt-1 block w-full"
                                    value={data.priority}
                                    onChange={e => setData('priority', e.target.value)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </SelectInput>
                                <InputError message={errors.priority} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="publish_at" value="Publish Date (Optional)" />
                                    <TextInput
                                        id="publish_at"
                                        type="datetime-local"
                                        className="mt-1 block w-full"
                                        value={data.publish_at || ''}
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
                                        value={data.expires_at || ''}
                                        onChange={e => setData('expires_at', e.target.value)}
                                    />
                                    <InputError message={errors.expires_at} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="inline-flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        checked={!!data.is_active}
                                        onChange={e => setData('is_active', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                                <div className="flex items-center space-x-3">
                                    <Link
                                        as="button"
                                        href={route('admin.announcements.index')}
                                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Save changes
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}


