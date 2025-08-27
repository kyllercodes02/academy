import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { CreditCard, AlertCircle } from 'lucide-react';

const CardRegistration = ({ students }) => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [cardId, setCardId] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Add event listener for input changes to detect NFC input
    useEffect(() => {
        const cardInput = document.getElementById('cardId');
        if (cardInput) {
            const handleInput = (e) => {
                // If the input changes very rapidly (as with NFC), trigger registration
                if (e.target.value && !isRegistering) {
                    handleSubmit(null, e.target.value);
                }
            };
            
            cardInput.addEventListener('input', handleInput);
            setIsListening(true);
            
            return () => {
                cardInput.removeEventListener('input', handleInput);
                setIsListening(false);
            };
        }
    }, [selectedStudent]); // Re-attach listener when selected student changes

    const handleSubmit = async (e, autoCardId = null) => {
        if (e) e.preventDefault();
        
        if (!selectedStudent) {
            setError('Please select a student');
            return;
        }

        const cardToRegister = autoCardId || cardId;
        
        if (!cardToRegister?.trim()) {
            setError('Please enter a card ID');
            return;
        }

        try {
            setError(null);
            setIsRegistering(true);
            setStatus('Registering card...');

            // Standardize card ID format (trim and lowercase)
            const standardizedCardId = cardToRegister.trim().toLowerCase();

            const response = await axios.post(route('admin.students.register-card', { student: selectedStudent }), {
                card_id: standardizedCardId
            });

            if (response.data.status === 'success') {
                setStatus('✓ Card registered successfully');
                setCardId('');
                
                // Play a success sound
                const audio = new Audio('/sounds/success.mp3');
                audio.play();
                
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to register card');
            // Play an error sound
            const audio = new Audio('/sounds/error.mp3');
            audio.play();
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Card Registration" />
            
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">Card Registration</h2>
                        </div>

                        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
                            {/* Student Selection */}
                            <div>
                                <label htmlFor="student" className="block text-sm font-medium text-gray-700">
                                    Select Student
                                </label>
                                <select
                                    id="student"
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Select a student...</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name} - {student.student_section}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Card ID Input */}
                            <div>
                                <label htmlFor="cardId" className="block text-sm font-medium text-gray-700">
                                    Card ID {isListening && <span className="text-green-600 ml-2">(Ready for NFC input)</span>}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CreditCard className={`h-5 w-5 ${isListening ? 'text-green-500' : 'text-gray-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        id="cardId"
                                        value={cardId}
                                        onChange={(e) => setCardId(e.target.value)}
                                        className={`block w-full pl-10 pr-3 py-2 border ${
                                            isListening ? 'border-green-300' : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                        placeholder={isListening ? "Tap NFC card or enter ID manually" : "Enter card ID"}
                                        disabled={isRegistering}
                                    />
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {isListening 
                                        ? "The system will automatically detect when an NFC card is tapped"
                                        : "Enter the card ID manually or select a student first to enable NFC detection"
                                    }
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {status && (
                                <div className={`rounded-md p-4 ${
                                    status.includes('✓') ? 'bg-green-50' : 'bg-blue-50'
                                }`}>
                                    <p className={`text-sm font-medium ${
                                        status.includes('✓') ? 'text-green-800' : 'text-blue-800'
                                    }`}>
                                        {status}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isRegistering || !selectedStudent}
                                className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                    isRegistering || !selectedStudent
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                            >
                                {isRegistering ? 'Registering...' : 'Register Card'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CardRegistration; 