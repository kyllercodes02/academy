import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ auth, student }) {
    const { data, setData, put, processing, errors } = useForm({
        name: student.name,
        student_id: student.student_id,
        grade_level: student.grade_level,
        section: student.section,
        card_id: student.card_id || '',
    });

    const [nfcStatus, setNfcStatus] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    // Function to start NFC scanning
    const startNfcScan = async () => {
        try {
            setIsScanning(true);
            setNfcStatus('Waiting for NFC card...');
            
            const ndef = new NDEFReader();
            await ndef.scan();
            
            ndef.addEventListener("reading", ({ serialNumber }) => {
                const cardId = serialNumber;
                setData('card_id', cardId);
                setNfcStatus('Card scanned successfully! ✅');
                setIsScanning(false);
            });

            ndef.addEventListener("error", () => {
                setNfcStatus('Error reading card. Please try again. ❌');
                setIsScanning(false);
            });

        } catch (error) {
            setNfcStatus('NFC not supported or permission denied. ❌');
            setIsScanning(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.students.update', student.id));
    };

    const handleUnregisterCard = () => {
        if (confirm('Are you sure you want to unregister this NFC card?')) {
            setData('card_id', '');
            setNfcStatus('Card unregistered successfully! ✅');
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Student" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold mb-6">Edit Student</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Student Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Student Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Student ID
                                        </label>
                                        <input
                                            type="text"
                                            value={data.student_id}
                                            onChange={e => setData('student_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.student_id && <div className="text-red-500 text-sm mt-1">{errors.student_id}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Grade Level
                                        </label>
                                        <input
                                            type="text"
                                            value={data.grade_level}
                                            onChange={e => setData('grade_level', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.grade_level && <div className="text-red-500 text-sm mt-1">{errors.grade_level}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Section
                                        </label>
                                        <input
                                            type="text"
                                            value={data.section}
                                            onChange={e => setData('section', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                        {errors.section && <div className="text-red-500 text-sm mt-1">{errors.section}</div>}
                                    </div>
                                </div>

                                {/* NFC Card Management */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">NFC Card Management</h3>
                                    
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="text"
                                            value={data.card_id}
                                            onChange={e => setData('card_id', e.target.value)}
                                            placeholder="No card registered"
                                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            readOnly
                                        />
                                        <button
                                            type="button"
                                            onClick={startNfcScan}
                                            disabled={isScanning}
                                            className={`px-4 py-2 rounded-md text-white ${
                                                isScanning 
                                                    ? 'bg-gray-400 cursor-not-allowed' 
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                        >
                                            {isScanning ? 'Scanning...' : data.card_id ? 'Replace Card' : 'Register Card'}
                                        </button>
                                        
                                        {data.card_id && (
                                            <button
                                                type="button"
                                                onClick={handleUnregisterCard}
                                                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
                                            >
                                                Unregister Card
                                            </button>
                                        )}
                                    </div>
                                    
                                    {nfcStatus && (
                                        <p className={`mt-2 text-sm ${
                                            nfcStatus.includes('successfully') 
                                                ? 'text-green-600' 
                                                : nfcStatus.includes('Waiting') 
                                                    ? 'text-blue-600' 
                                                    : 'text-red-600'
                                        }`}>
                                            {nfcStatus}
                                        </p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className={`px-4 py-2 rounded-md text-white ${
                                            processing 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    >
                                        {processing ? 'Saving...' : 'Update Student'}
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