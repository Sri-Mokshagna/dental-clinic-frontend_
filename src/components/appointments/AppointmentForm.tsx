'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Patient, Appointment, User } from '@/types';
import { useData } from '@/context/DataContext';

interface AppointmentFormProps {
    patient?: Patient | null;
    onSave: () => void;
    onClose: () => void;
}

export default function AppointmentForm({ patient, onSave, onClose }: AppointmentFormProps) {
    const { patients, users, refreshPatients, refreshUsers, createAppointment, createPatient } = useData();

    // Patient selection/search
    const [patientSearch, setPatientSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patient || null);

    // Doctor selection
    const [doctorId, setDoctorId] = useState<string>('');

    // Datetime
    const [appointmentDateTime, setAppointmentDateTime] = useState<string>('');

    // Optional fields
    const [treatmentDetails, setTreatmentDetails] = useState('');
    const [treatmentCost, setTreatmentCost] = useState<string>('');

    const [error, setError] = useState('');

    // Inline quick patient register
    const [showQuickRegister, setShowQuickRegister] = useState(false);
    const [newPatient, setNewPatient] = useState({
        fullName: '',
        phoneNumber: '',
        age: '',
        gender: 'male',
        address: '',
        email: '',
        medicalInfo: '',
    });
    const [savingQuickPatient, setSavingQuickPatient] = useState(false);

    useEffect(() => {
        if (!patients || patients.length === 0) {
            refreshPatients();
        }
        if (!users || users.length === 0) {
            refreshUsers();
        }
        // Pre-fill datetime with nearest future 30 min block
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        const isoLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        setAppointmentDateTime(isoLocal);
    }, [refreshPatients, refreshUsers]);

    const doctorOptions = useMemo(() => {
        return (users || []).filter((u: User) => u.role === 'DOCTOR');
    }, [users]);

    const filteredPatients = useMemo(() => {
        const term = patientSearch.trim().toLowerCase();
        if (!term) return patients;
        return patients.filter(p =>
            (p.fullName || '').toLowerCase().includes(term) ||
            (p.phoneNumber || '').toLowerCase().includes(term)
        );
    }, [patients, patientSearch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedPatient) {
            setError('Please select a patient.');
            return;
        }
        if (!doctorId) {
            setError('Please select a doctor.');
            return;
        }
        if (!appointmentDateTime) {
            setError('Please choose appointment date/time.');
            return;
        }
        const apptISO = new Date(appointmentDateTime).toISOString().slice(0, 19); // trim to seconds
        try {
            await createAppointment({
                // Backend expects these keys
                appointmentDate: apptISO,
                patientId: selectedPatient.id as any,
                doctorId: parseInt(doctorId, 10) as any,
                treatmentDetails: treatmentDetails || undefined,
                treatmentCost: treatmentCost ? parseFloat(treatmentCost) : undefined,
            } as unknown as Omit<Appointment, 'id'>);
            onSave();
        } catch (err) {
            setError('Failed to create appointment.');
            toast.error('Failed to create appointment');
        }
    };

    const handleQuickRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingQuickPatient(true);
        setError('');
        try {
            const payload: any = {
                fullName: newPatient.fullName,
                age: newPatient.age ? parseInt(newPatient.age, 10) : 0,
                gender: newPatient.gender,
                phoneNumber: newPatient.phoneNumber, // no +91 prefixing
                address: newPatient.address,
                email: newPatient.email,
                medicalInfo: newPatient.medicalInfo,
            };
            await createPatient(payload);
            await refreshPatients();
            const created = (p: Patient) => p.fullName === payload.fullName && p.phoneNumber === payload.phoneNumber;
            const justAdded = patients.find(created) || (await (async () => (await refreshPatients(), patients.find(created)))());
            if (justAdded) {
                setSelectedPatient(justAdded);
                setShowQuickRegister(false);
                toast.success('Patient registered');
            }
        } catch (err) {
            setError('Failed to register patient.');
            toast.error('Failed to register patient');
        } finally {
            setSavingQuickPatient(false);
        }
    };

    return (
        <div className="bg-white p-4 shadow-md rounded-lg mt-4">
            <h2 className="text-xl font-bold mb-4">New Appointment</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {/* Patient selection & quick add */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                    {selectedPatient ? (
                        <div className="flex items-center justify-between p-2 border rounded">
                            <div>
                                <div className="font-medium">{selectedPatient.fullName}</div>
                                <div className="text-sm text-gray-600">{selectedPatient.phoneNumber}</div>
                            </div>
                            <button type="button" onClick={() => setSelectedPatient(null)} className="text-blue-600">Change</button>
                        </div>
                    ) : (
                        <div>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="Search by name or phone"
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                    className="flex-1 px-3 py-2 border rounded"
                                />
                                <button type="button" className="px-3 py-2 border rounded" onClick={() => refreshPatients()}>Refresh</button>
                                <button type="button" className="px-3 py-2 bg-gray-100 rounded" onClick={() => setShowQuickRegister(s => !s)}>
                                    {showQuickRegister ? 'Close' : 'Register New'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                                {filteredPatients.map(p => (
                                    <button key={p.id} type="button" onClick={() => setSelectedPatient(p)} className="text-left p-2 border rounded hover:bg-gray-50">
                                        <div className="font-medium">{p.fullName}</div>
                                        <div className="text-sm text-gray-600">{p.phoneNumber}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {showQuickRegister && (
                    <div className="mb-4 p-3 border rounded bg-gray-50">
                        <h3 className="font-semibold mb-2">Quick Register Patient</h3>
                        <form onSubmit={handleQuickRegister} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input placeholder="Full Name" className="px-3 py-2 border rounded" value={newPatient.fullName} onChange={e => setNewPatient({ ...newPatient, fullName: e.target.value })} required />
                            <input placeholder="Phone Number" className="px-3 py-2 border rounded" value={newPatient.phoneNumber} onChange={e => setNewPatient({ ...newPatient, phoneNumber: e.target.value })} required />
                            <input placeholder="Email" className="px-3 py-2 border rounded" value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} />
                            <input placeholder="Age" type="number" className="px-3 py-2 border rounded" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} />
                            <select className="px-3 py-2 border rounded" value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <input placeholder="Address" className="px-3 py-2 border rounded" value={newPatient.address} onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} />
                            <textarea placeholder="Medical Info" className="px-3 py-2 border rounded md:col-span-2" value={newPatient.medicalInfo} onChange={e => setNewPatient({ ...newPatient, medicalInfo: e.target.value })} />
                            <div className="md:col-span-2 flex justify-end gap-2">
                                <button type="button" className="px-3 py-2" onClick={() => setShowQuickRegister(false)}>Cancel</button>
                                <button type="submit" disabled={savingQuickPatient} className="px-3 py-2 bg-blue-600 text-white rounded">{savingQuickPatient ? 'Saving...' : 'Save Patient'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Date & doctor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="datetime" className="block text-sm font-medium text-gray-700">Date & Time</label>
                        <input
                            id="datetime"
                            type="datetime-local"
                            value={appointmentDateTime}
                            onChange={(e) => setAppointmentDateTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Doctor</label>
                        <select
                            id="doctor"
                            value={doctorId}
                            onChange={e => setDoctorId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        >
                            <option value="">Select a doctor</option>
                            {doctorOptions.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.fullName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Optional details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Treatment Details</label>
                        <textarea className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" value={treatmentDetails} onChange={e => setTreatmentDetails(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Treatment Cost</label>
                        <input type="number" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" value={treatmentCost} onChange={e => setTreatmentCost(e.target.value)} />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save Appointment</button>
                </div>
            </form>
        </div>
    );
}
