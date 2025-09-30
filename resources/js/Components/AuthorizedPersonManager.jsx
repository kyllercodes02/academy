import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Star, Phone, Mail, MapPin, IdCard, Save, X } from 'lucide-react';
import axios from 'axios';

const AuthorizedPersonManager = ({ studentId, onClose }) => {
    const [authorizedPersons, setAuthorizedPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        relationship: '',
        contact_number: '',
        email: '',
        address: '',
        id_type: '',
        id_number: '',
        is_primary: false,
        notes: ''
    });

    useEffect(() => {
        fetchAuthorizedPersons();
    }, [studentId]);

    const fetchAuthorizedPersons = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/authorized-persons?student_id=${studentId}`);
            if (response.data.success) {
                setAuthorizedPersons(response.data.data.authorized_persons);
            }
        } catch (error) {
            console.error('Error fetching authorized persons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPerson) {
                await axios.put(`/api/admin/authorized-persons/${editingPerson.id}`, formData);
            } else {
                await axios.post('/api/admin/authorized-persons', {
                    ...formData,
                    student_id: studentId
                });
            }
            
            await fetchAuthorizedPersons();
            resetForm();
        } catch (error) {
            console.error('Error saving authorized person:', error);
        }
    };

    const handleEdit = (person) => {
        setEditingPerson(person);
        setFormData({
            name: person.name,
            relationship: person.relationship,
            contact_number: person.contact_number,
            email: person.email || '',
            address: person.address || '',
            id_type: person.id_type || '',
            id_number: person.id_number || '',
            is_primary: person.is_primary,
            notes: person.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this authorized person?')) {
            try {
                await axios.delete(`/api/admin/authorized-persons/${id}`);
                await fetchAuthorizedPersons();
            } catch (error) {
                console.error('Error deleting authorized person:', error);
            }
        }
    };

    const handleSetPrimary = async (id) => {
        try {
            await axios.post(`/api/admin/authorized-persons/${id}/set-primary`);
            await fetchAuthorizedPersons();
        } catch (error) {
            console.error('Error setting primary:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            relationship: '',
            contact_number: '',
            email: '',
            address: '',
            id_type: '',
            id_number: '',
            is_primary: false,
            notes: ''
        });
        setEditingPerson(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Authorized Persons for Pickup</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Person
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingPerson ? 'Edit Authorized Person' : 'Add Authorized Person'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Relationship *
                                        </label>
                                        <select
                                            required
                                            value={formData.relationship}
                                            onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Relationship</option>
                                            <option value="Father">Father</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Guardian">Guardian</option>
                                            <option value="Grandfather">Grandfather</option>
                                            <option value="Grandmother">Grandmother</option>
                                            <option value="Uncle">Uncle</option>
                                            <option value="Aunt">Aunt</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contact Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.contact_number}
                                            onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID Type
                                        </label>
                                        <select
                                            value={formData.id_type}
                                            onChange={(e) => setFormData({...formData, id_type: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select ID Type</option>
                                            <option value="Driver's License">Driver's License</option>
                                            <option value="Passport">Passport</option>
                                            <option value="National ID">National ID</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            ID Number
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.id_number}
                                            onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_primary}
                                                onChange={(e) => setFormData({...formData, is_primary: e.target.checked})}
                                                className="mr-2"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Set as Primary Authorized Person
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {editingPerson ? 'Update' : 'Add'} Person
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Authorized Persons List */}
            <div className="p-6">
                {authorizedPersons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No authorized persons added yet.</p>
                        <p className="text-sm">Click "Add Person" to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {authorizedPersons.map((person) => (
                            <div
                                key={person.id}
                                className={`p-4 rounded-lg border-2 ${
                                    person.is_primary 
                                        ? 'border-yellow-300 bg-yellow-50' 
                                        : 'border-gray-200 bg-white'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {person.name}
                                            </h3>
                                            {person.is_primary && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">Relationship:</span>
                                                <span>{person.relationship}</span>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4" />
                                                <span>{person.contact_number}</span>
                                            </div>
                                            
                                            {person.email && (
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{person.email}</span>
                                                </div>
                                            )}
                                            
                                            {person.address && (
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="truncate">{person.address}</span>
                                                </div>
                                            )}
                                            
                                            {person.id_type && person.id_number && (
                                                <div className="flex items-center space-x-2">
                                                    <IdCard className="h-4 w-4" />
                                                    <span>{person.id_type}: {person.id_number}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {person.notes && (
                                            <div className="mt-2 text-sm text-gray-600">
                                                <span className="font-medium">Notes:</span> {person.notes}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex space-x-2 ml-4">
                                        {!person.is_primary && (
                                            <button
                                                onClick={() => handleSetPrimary(person.id)}
                                                className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded"
                                                title="Set as Primary"
                                            >
                                                <Star className="h-4 w-4" />
                                            </button>
                                        )}
                                        
                                        <button
                                            onClick={() => handleEdit(person)}
                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        
                                        <button
                                            onClick={() => handleDelete(person.id)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorizedPersonManager;
