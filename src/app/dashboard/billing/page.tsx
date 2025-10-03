'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Patient } from '@/types';
import { ApiService } from '@/lib/api';
import withAuth from '@/components/auth/withAuth';

function BillingPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let mounted = true;
    ApiService.getPatients()
      .then((list) => { if (mounted) setPatients(list); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) {
      return patients;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return patients.filter(patient => {
        const nameMatch = patient.fullName && patient.fullName.toLowerCase().includes(lowercasedSearchTerm);
        const phoneMatch = patient.phoneNumber && patient.phoneNumber.includes(lowercasedSearchTerm);
        return nameMatch || phoneMatch;
    });
  }, [searchTerm, patients]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Billing Search</h1>
      </div>

      <div className="bg-white p-4 shadow-md rounded-lg mt-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by patient name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-md w-full md:w-1/3"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 font-semibold">Patient Name</th>
                <th className="p-3 font-semibold">Contact</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{patient.fullName}</td>
                  <td className="p-3">{patient.phoneNumber}</td>
                  <td className="p-3">
                    <Link href={`/dashboard/billing/patient/${patient.id}`} className="text-blue-600 hover:underline">
                      View Billing
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPatients.length === 0 && <p className="text-center text-gray-500 py-4">No matching patients found.</p>}
      </div>
    </div>
  );
}

export default withAuth(BillingPage, ['owner', 'doctor', 'receptionist', 'staff']);
