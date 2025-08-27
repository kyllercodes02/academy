import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { CreditCard, UserPlus, AlertCircle } from 'lucide-react';

export default function CardRegistration({ auth, students }) {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isReading, setIsReading] = useState(false);
    const [cardId, setCardId] = useState('');
    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: '',
        card_id: ''
    });

    // Function to handle NFC reading
    const startNFCReading = async () => {
        if ('NDEFReader' in window) {
            try {
                setIsReading(true);
                const ndef = new window.NDEFReader();
                await ndef.scan();
                
                ndef.addEventListener("reading", ({ serialNumber }) => {
                    setCardId(serialNumber);
                    setData('card_id', serialNumber);
                });
            } catch (error) {
                console.error(error);
                alert('Error reading NFC: ' + error.message);
            }
        } else {
            alert('NFC is not supported on this device');
        }
    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        setData('student_id', student.id);
        startNFCReading();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.students.register-card'), {
            onSuccess: () => {
                setSelectedStudent(null);
                setCardId('');
                reset();
                setIsReading(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Card Registration</h2>}
        >
            <Head title="Card Registration" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Register NFC Card</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Select a student and tap their NFC card to register it.
                                </p>
                            </div>

                            {/* Student Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            selectedStudent?.id === student.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                        onClick={() => handleStudentSelect(student)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <UserPlus className="text-blue-600" size={20} />
                                            <div>
                                                <div className="font-medium">{student.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {student.grade_level} - {student.student_section}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Card Reading Status */}
                            {selectedStudent && (
                                <div className="mt-6">
                                    <div className={`p-4 rounded-lg ${cardId ? 'bg-green-50' : 'bg-blue-50'}`}>
                                        <div className="flex items-center space-x-3">
                                            {cardId ? (
                                                <CreditCard className="text-green-600" size={24} />
                                            ) : (
                                                <AlertCircle className="text-blue-600" size={24} />
                                            )}
                                            <div>
                                                <div className="font-medium">
                                                    {cardId ? 'Card Detected!' : 'Waiting for Card...'}
                                                </div>
                                                <div className="text-sm">
                                                    {cardId
                                                        ? `Card ID: ${cardId}`
                                                        : 'Please tap the NFC card on your device'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {cardId && (
                                        <form onSubmit={handleSubmit} className="mt-4">
                                            <button
                                                type="submit"
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                                disabled={processing}
                                            >
                                                Register Card
                                            </button>
                                        </form>
                                    )}

                                    {errors.card_id && (
                                        <div className="mt-2 text-sm text-red-600">
                                            {errors.card_id}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 