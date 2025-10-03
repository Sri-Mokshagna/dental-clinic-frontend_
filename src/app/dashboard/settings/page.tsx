'use client';

import React, { useState, useEffect } from 'react';
import withAuth from '@/components/auth/withAuth';
import { getCurrentUser } from '@/lib/session';
import { doctors as allDoctors, addDoctor, deleteDoctor, Doctor, ClinicProfile } from '@/lib/data-manager';
import { ApiService } from '@/lib/api';
import { useClinic } from '@/context/ClinicContext';
import UserManagement from '@/components/admin/UserManagement';
import MedicationManager from '@/components/admin/MedicationManager';
import LogoUpload from '@/components/admin/LogoUpload';

function SettingsDashboard() {
  const user = getCurrentUser();
  const { clinicProfile, updateProfile } = useClinic();
  const [settings, setSettings] = useState<any | null>(null);
  const [fee, setFee] = useState<number>(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState('');
  const [profileToEdit, setProfileToEdit] = useState<ClinicProfile>({ name: '', address: '', contact: '' });


  useEffect(() => {
    ApiService.getSettings()
      .then((s: any) => {
        const normalized = {
          ...s,
          appointmentSettings: {
            startTime: s?.startTime || '10:00',
            endTime: s?.endTime || '20:00',
            slotDuration: s?.slotDuration ?? 30,
          },
        };
        setSettings(normalized);
      })
      .catch(() => {});
    setDoctors(allDoctors);
    if (clinicProfile) {
      setProfileToEdit(clinicProfile);
    }
  }, [clinicProfile]);

  useEffect(() => {
    if (settings) {
      setFee(settings.defaultConsultationFee ?? 0);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!settings) return;
    const payload = {
      defaultConsultationFee: fee,
      startTime: settings.appointmentSettings?.startTime,
      endTime: settings.appointmentSettings?.endTime,
      slotDuration: settings.appointmentSettings?.slotDuration,
      name: settings.name,
      address: settings.address,
      contact: settings.contact,
    };
    const saved = await ApiService.updateSettings(payload);
    const normalized = {
      ...saved,
      appointmentSettings: {
        startTime: saved?.startTime || '10:00',
        endTime: saved?.endTime || '20:00',
        slotDuration: saved?.slotDuration ?? 30,
      },
    };
    setSettings(normalized);
    alert('Settings saved!');
  };

  const handleTimingChange = (key: string, value: string) => {
    if (settings) {
      setSettings(prev => ({
        ...prev,
        appointmentSettings: {
          ...prev.appointmentSettings,
          [key]: value,
        },
      }));
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileToEdit(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    if (profileToEdit) {
      updateProfile(profileToEdit);
      alert('Clinic profile updated!');
    }
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDoctorName && newDoctorSpecialty) {
      const newDoctor: Doctor = {
        id: `d-${Date.now()}`,
        userId: `u-d-${Date.now()}`, // Mock user id
        firstName: newDoctorName.split(' ')[0],
        lastName: newDoctorName.split(' ').slice(1).join(' '),
        specialty: newDoctorSpecialty,
        contact: { phone: '', email: '' }, // Placeholder contact
        availability: [], // Placeholder availability
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addDoctor(newDoctor);
      setNewDoctorName('');
      setNewDoctorSpecialty('');
      setDoctors(allDoctors); // Refresh the list
    }
  };

  const handleDeleteDoctor = (doctorId: string) => {
    if (window.confirm('Are you sure you want to remove this doctor?')) {
      deleteDoctor(doctorId);
      setDoctors(allDoctors.filter(d => d.id !== doctorId));
    }
  };

  if (user?.role !== 'owner') {
    return (
      <div className="p-6 text-red-500">
        You do not have permission to view this page.
      </div>
    );
  }

  if (!settings || !clinicProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Clinic Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings Section */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700">
                Default Consultation Fee
              </label>
              <input
                type="number"
                id="consultationFee"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Appointment Timings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input type="time" id="startTime" value={settings.appointmentSettings.startTime} onChange={e => handleTimingChange('startTime', e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                  <input type="time" id="endTime" value={settings.appointmentSettings.endTime} onChange={e => handleTimingChange('endTime', e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label htmlFor="slotDuration" className="block text-sm font-medium text-gray-700">Slot Duration (mins)</label>
                  <input type="number" id="slotDuration" value={settings.appointmentSettings.slotDuration} onChange={e => handleTimingChange('slotDuration', parseInt(e.target.value))} className="mt-1 w-full p-2 border rounded-md" step="5" />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Save General Settings
            </button>
          </div>
        </div>

        {/* Logo Upload Section */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-4">Clinic Logo</h2>
          <LogoUpload />
        </div>

        {/* Clinic Profile Section */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-4">Clinic Profile</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">
                Clinic Name
              </label>
              <input
                type="text"
                id="clinicName"
                name="name"
                value={profileToEdit.name}
                onChange={handleProfileChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="clinicAddress"
                name="address"
                rows={3}
                value={profileToEdit.address}
                onChange={handleProfileChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="clinicContact" className="block text-sm font-medium text-gray-700">
                Contact Info (Phone/Email)
              </label>
              <input
                type="text"
                id="clinicContact"
                name="contact"
                value={profileToEdit.contact}
                onChange={handleProfileChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Save Clinic Profile
            </button>
          </div>
        </div>

        {/* User Management Section */}
        <div className="lg:col-span-2">
          <UserManagement onUserUpdate={() => {}} />
        </div>

        {/* Medication Management Section */}
        <div className="lg:col-span-2">
          <MedicationManager onMedicationUpdate={() => {}} />
        </div>
      </div>
    </div>
  );
}

export default withAuth(SettingsDashboard, ['owner']);
