'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import withAuth from '@/components/auth/withAuth';
import { getCurrentUser } from '@/lib/session';
import { useData } from '@/context/DataContext';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    fullName: '',
    age: '',
    gender: 'male',
    address: '',
    medicalInfo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const router = useRouter();
  const currentUser = getCurrentUser();
  const { createPatient } = useData();

  const validatePhone = (phone: string) => {
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Phone number must be exactly 10 digits.');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(formData.phoneNumber)) {
      return;
    }

    if (!formData.email || !formData.phoneNumber || !formData.fullName) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const payload: any = {
        fullName: formData.fullName,
        age: formData.age ? parseInt(formData.age, 10) : 0,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        email: formData.email,
        medicalInfo: formData.medicalInfo,
        createdById: currentUser?.id,
      };
      if (currentUser && (currentUser.role === 'owner' || currentUser.role === 'doctor')) {
        payload.doctorId = currentUser.id;
      }
      await createPatient(payload);
      alert('Patient registered successfully');
      router.push('/dashboard/patients');
    } catch (err) {
      alert('Failed to register patient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Register New Patient</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            {phoneError && <p className="text-red-600 text-xs mt-1">{phoneError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input name="address" value={formData.address} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Medical Info</label>
          <textarea name="medicalInfo" value={formData.medicalInfo} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={4} />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {isLoading ? 'Saving...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(RegisterPage, ['owner', 'doctor', 'staff', 'receptionist', 'admin']);
