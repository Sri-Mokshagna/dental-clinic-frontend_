'use client';

import React, { useState, useMemo } from 'react';
import { Patient } from '@/types';
import { useRouter } from 'next/navigation';

interface PatientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
}

export default function PatientSearchModal({ isOpen, onClose, patients }: PatientSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredPatients = useMemo(() => {
    if (!searchTerm) {
      return patients;
    }
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.phone.includes(searchTerm)
    );
  }, [searchTerm, patients]);

  const handlePatientSelect = (patientId: string) => {
    router.push(`/dashboard/billing/patient/${patientId}`);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Select a Patient</h3>
          <div className="mt-2 px-7 py-3">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-4 h-64 overflow-y-auto">
            <ul className="divide-y divide-gray-200">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <li
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient.id)}
                    className="p-4 hover:bg-gray-100 cursor-pointer text-left"
                  >
                    <p className="font-semibold">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.contact.phone}</p>
                  </li>
                ))
              ) : (
                <li className="p-4 text-gray-500">No patients found.</li>
              )}
            </ul>
          </div>
          <div className="items-center px-4 py-3">
            <button
              id="close-modal"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



