'use client';

import { useState, useEffect, useMemo } from 'react';
import { Appointment, Patient } from '@/types';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import AppointmentDetailModal from '@/components/appointments/AppointmentDetailModal';
import { ApiService } from '@/lib/api';

export default function AppointmentList() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [filter, setFilter] = useState('today');
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [patientAppointmentHistory, setPatientAppointmentHistory] = useState<Appointment[]>([]);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [selectedPatientForForm, setSelectedPatientForForm] = useState<Patient | null>(null);

    useEffect(() => {
        let mounted = true;
        const loadData = async () => {
            try {
                const [apps, pats] = await Promise.all([
                    ApiService.getAppointments(),
                    ApiService.getPatients(),
                ]);
                if (!mounted) return;
                // Backend returns appointmentDate as ISO string and patient object
                setAppointments(apps);
                setPatients(pats);
            } catch (e) {
                // no-op for now
            }
        };
        loadData();
        return () => { mounted = false; };
    }, []);

    const patientMap = useMemo(() => new Map(patients.map(p => [p.id, p])), [patients]);

    const filteredPatients = useMemo(() => {
        if (!searchTerm.trim()) {
            return patients;
        }
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return patients.filter(patient =>
            (patient.fullName && patient.fullName.toLowerCase().includes(lowercasedSearchTerm)) ||
            (patient.phoneNumber && patient.phoneNumber.includes(lowercasedSearchTerm))
        );
    }, [searchTerm, patients]);

    const displayedAppointments = useMemo(() => {
        if (filter === 'all' || searchTerm) {
            return []; // Don't show appointments when 'All' is selected or when searching
        }

        const items = [...appointments];
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        switch (filter) {
            case 'today':
                return items.filter(app => {
                    const dt = new Date(app.appointmentDate);
                    return dt >= todayStart && dt <= todayEnd;
                });
            case 'upcoming':
                return items.filter(app => new Date(app.appointmentDate) > todayEnd);
            case 'past':
                return items.filter(app => new Date(app.appointmentDate) < todayStart);
            case 'date':
                const selectedDate = new Date(date);
                const dayStart = new Date(selectedDate.setHours(0, 0, 0, 0));
                const dayEnd = new Date(selectedDate.setHours(23, 59, 59, 999));
                return items.filter(app => {
                    const dt = new Date(app.appointmentDate);
                    return dt >= dayStart && dt <= dayEnd;
                });
            default:
                return items;
        }

    }, [appointments, filter, date, searchTerm]);

    const getPatientNameById = (patientId: number) => {
        const patient = patientMap.get(patientId);
        return patient ? patient.fullName : 'Unknown';
    };

    const handlePatientClick = (patient: Patient) => {
        const history = appointments
            .filter(app => app.patient && app.patient.id === patient.id)
            .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
        setPatientAppointmentHistory(history);
        setSelectedPatient(patient);
    };

    if (selectedPatient) {
        return (
            <div>
                <button onClick={() => setSelectedPatient(null)} className="text-sm text-blue-500 hover:underline mb-4">&larr; Back to list</button>
                {patientAppointmentHistory.length > 0 && (
                    <div className="bg-white p-4 shadow-md rounded-lg mb-4">
                        <h3 className="text-lg font-semibold mb-2">Appointment History for {selectedPatient.fullName}</h3>
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {patientAppointmentHistory.map(app => (
                                <li key={app.id} className="text-sm p-2 bg-gray-50 rounded-md">
                                    {formatDateTime(new Date(app.appointmentDate))}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <AppointmentForm
                    patient={selectedPatient}
                    onSave={() => {
                        setSelectedPatient(null);
                        // refresh list
                        ApiService.getAppointments().then(setAppointments).catch(() => {});
                    }}
                    onClose={() => setSelectedPatient(null)}
                />
            </div>
        );
    }
    
    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Appointments</h2>

            {/* Appointment Form Section */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <h3 className="text-lg font-semibold mb-2 sm:mb-0">Create New Appointment</h3>
                    <button 
                        onClick={() => setShowAppointmentForm(!showAppointmentForm)} 
                        className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm w-full sm:w-auto"
                    >
                        {showAppointmentForm ? 'Close Form' : '+ New Appointment'}
                    </button>
                </div>
                {showAppointmentForm && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-md font-medium mb-3">Select Patient for New Appointment</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                            {patients.map(patient => (
                                <button
                                    key={patient.id}
                                    onClick={() => setSelectedPatientForForm(patient)}
                                    className="p-3 text-left bg-white border rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    <p className="font-medium">{patient.fullName}</p>
                                    <p className="text-sm text-gray-600">{patient.phoneNumber}</p>
                                </button>
                            ))}
                        </div>
                        {selectedPatientForForm && (
                            <div className="mt-4">
                                <AppointmentForm 
                                    patient={selectedPatientForForm} 
                                    onSave={() => {
                                        setShowAppointmentForm(false);
                                        setSelectedPatientForForm(null);
                                        ApiService.getAppointments().then(setAppointments).catch(() => {});
                                    }} 
                                    onClose={() => {
                                        setShowAppointmentForm(false);
                                        setSelectedPatientForForm(null);
                                    }} 
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-4 items-center">
                <input
                    type="text"
                    placeholder="Search patients by name or phone..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setFilter('all'); // Switch to 'all' view when searching
                    }}
                    className="p-2 border rounded-md w-full md:w-auto md:flex-grow"
                />

                <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setSearchTerm(''); setFilter('today'); }} className={`py-2 px-4 rounded-md text-sm ${filter === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Today</button>
                    <button onClick={() => { setSearchTerm(''); setFilter('upcoming'); }} className={`py-2 px-4 rounded-md text-sm ${filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Upcoming</button>
                    <button onClick={() => { setSearchTerm(''); setFilter('past'); }} className={`py-2 px-4 rounded-md text-sm ${filter === 'past' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Past</button>
                    <button onClick={() => { setSearchTerm(''); setFilter('all'); }} className={`py-2 px-4 rounded-md text-sm ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>All Patients</button>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => { setSearchTerm(''); setDate(e.target.value); setFilter('date'); }}
                        className="p-2 border rounded-md text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                {filter === 'all' || searchTerm ? (
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-3 border-b">Patient Name</th>
                                <th className="p-3 border-b">Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map(patient => (
                                <tr key={patient.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handlePatientClick(patient)}>
                                    <td className="p-3 border-b text-blue-500 hover:underline">{patient.name}</td>
                                    <td className="p-3 border-b">{patient.contact?.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <>
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    <th className="p-3 border-b">Patient</th>
                                    <th className="p-3 border-b whitespace-nowrap">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedAppointments.sort((a,b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()).map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAppointment(app)}>
                                        <td className="p-3 border-b text-blue-500 hover:underline">{app.patient ? app.patient.fullName : 'Unknown'}</td>
                                        <td className="p-3 border-b whitespace-nowrap">{formatDateTime(new Date(app.appointmentDate))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* All Appointments Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">All Appointments</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-3 border-b">Patient</th>
                                        <th className="p-3 border-b">Date & Time</th>
                                        <th className="p-3 border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.sort((a,b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()).map(app => (
                                        <tr key={app.id} className="hover:bg-gray-50">
                                            <td className="p-3 border-b text-blue-500 hover:underline cursor-pointer" onClick={() => setSelectedAppointment(app)}>
                                                {app.patient ? app.patient.fullName : 'Unknown'}
                                            </td>
                                            <td className="p-3 border-b">{formatDateTime(new Date(app.appointmentDate))}</td>
                                            <td className="p-3 border-b">
                                                <button 
                                                    onClick={() => setSelectedAppointment(app)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {(filter !== 'all' && !searchTerm && displayedAppointments.length === 0) && (
                    <p className="text-center text-gray-500 py-4">No appointments found for this filter.</p>
                )}
                {(filter === 'all' || searchTerm) && filteredPatients.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No patients found.</p>
                )}
            </div>
            {selectedAppointment && (
                <AppointmentDetailModal
                    appointment={selectedAppointment}
                    patient={selectedAppointment.patient}
                    onClose={() => setSelectedAppointment(null)}
                    onUpdate={() => {
                        ApiService.getAppointments().then(setAppointments).catch(() => {});
                    }}
                />
            )}
        </div>
    );
}
