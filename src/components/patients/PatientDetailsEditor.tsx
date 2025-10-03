'use client';

import { useState } from 'react';
import { Patient, User } from '@/types';
import { ApiService } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';

interface PatientDetailsEditorProps {
  patient: Patient;
  onUpdate: () => void;
}

export default function PatientDetailsEditor({ patient, onUpdate }: PatientDetailsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: patient.fullName || '',
    age: patient.age || 0,
    gender: patient.gender || '',
    phoneNumber: patient.phoneNumber || '',
    address: patient.address || '',
    email: patient.email || '',
    medicalInfo: patient.medicalInfo || ''
  });

  const currentUser = getCurrentUser() as User | undefined;

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await ApiService.updatePatient(String(patient.id), formData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error updating patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: patient.fullName || '',
      age: patient.age || 0,
      gender: patient.gender || '',
      phoneNumber: patient.phoneNumber || '',
      address: patient.address || '',
      email: patient.email || '',
      medicalInfo: patient.medicalInfo || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isEditing) {
    return (
      <div className="bg-white p-4 shadow-md rounded-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{patient.fullName}</h1>
            <div className="text-gray-600 mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm md:text-base">
              <span><strong>Age:</strong> {patient.age || 'N/A'}</span>
              <span><strong>Phone:</strong> {patient.phoneNumber}</span>
              {patient.gender && <span><strong>Gender:</strong> {patient.gender}</span>}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-600"
          >
            Edit Details
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Email:</strong> {patient.email || 'N/A'}
          </div>
          <div>
            <strong>Address:</strong> {patient.address || 'N/A'}
          </div>
          {patient.medicalInfo && (
            <div className="md:col-span-2">
              <strong>Medical Info:</strong> {patient.medicalInfo}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 shadow-md rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4">Edit Patient Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age *
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medical Information
          </label>
          <textarea
            value={formData.medicalInfo}
            onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="Enter any relevant medical information, allergies, or notes..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

