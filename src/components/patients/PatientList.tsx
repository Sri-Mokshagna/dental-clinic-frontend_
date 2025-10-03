'use client';

import { useState, useMemo, useEffect } from 'react';
import { Patient } from '@/types';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function PatientList() {
    const { patients, deletePatient, loading } = useData();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [debounced, setDebounced] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const id = setTimeout(() => setDebounced(searchTerm), 300);
        return () => clearTimeout(id);
    }, [searchTerm]);
    const [selectedPatientIds, setSelectedPatientIds] = useState<number[]>([]);

    const filteredPatients = useMemo(() => {
        return patients.filter(patient => {
            const nameMatch = patient.fullName && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase());
            const phoneMatch = patient.phoneNumber && patient.phoneNumber.includes(searchTerm);
            return nameMatch || phoneMatch;
        });
    }, [patients, searchTerm]);

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredPatients.slice(start, start + pageSize);
    }, [filteredPatients, page]);

    const handleSelectPatient = (patientId: number) => {
        setSelectedPatientIds(prevSelected =>
            prevSelected.includes(patientId)
                ? prevSelected.filter(id => id !== patientId)
                : [...prevSelected, patientId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedPatientIds(filteredPatients.map(p => p.id));
        } else {
            setSelectedPatientIds([]);
        }
    };

    const handleDeleteSelected = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedPatientIds.length} selected patient(s)? This will also delete all their associated appointments and bills.`)) {
            try {
                for (const patientId of selectedPatientIds) {
                    await deletePatient(patientId);
                }
                setSelectedPatientIds([]);
            } catch (error) {
                console.error('Error deleting patients:', error);
                alert('Error deleting patients. Please try again.');
            }
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    if (loading.patients) {
        return <div className="flex items-center justify-center p-8">Loading patients...</div>;
    }

    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold">Patient List</h2>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="p-2 border rounded-md w-full md:w-1/3"
                />
                {isAdmin && selectedPatientIds.length > 0 && (
                    <button 
                        onClick={handleDeleteSelected}
                        className="bg-red-500 text-white py-2 px-4 rounded-md w-full md:w-auto"
                    >
                        Delete Selected ({selectedPatientIds.length})
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            {isAdmin && (
                                <th className="p-3 border-b w-4">
                                    <input type="checkbox" onChange={handleSelectAll} />
                                </th>
                            )}
                            <th className="p-3 border-b">Name</th>
                            <th className="p-3 border-b">Age</th>
                            <th className="p-3 border-b">Phone</th>
                            <th className="p-3 border-b">Address</th>
                            <th className="p-3 border-b">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map(patient => (
                            <tr key={patient.id} className="hover:bg-gray-50">
                                {isAdmin && (
                                    <td className="p-3 border-b">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedPatientIds.includes(patient.id)}
                                            onChange={() => handleSelectPatient(patient.id)}
                                        />
                                    </td>
                                )}
                                <td className="p-3 border-b">
                                    <Link href={`/dashboard/patients/${patient.id}`} className="text-blue-600 hover:underline font-medium">
                                        {patient.fullName}
                                    </Link>
                                </td>
                                <td className="p-3 border-b">{patient.age}</td>
                                <td className="p-3 border-b">{patient.phoneNumber}</td>
                                <td className="p-3 border-b">{patient.address}</td>
                                <td className="p-3 border-b">{patient.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3">
                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                <span className="text-sm">Page {page} / {Math.max(1, Math.ceil(filteredPatients.length / pageSize))}</span>
                <button disabled={page >= Math.ceil(filteredPatients.length / pageSize)} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
        </div>
    );
}
