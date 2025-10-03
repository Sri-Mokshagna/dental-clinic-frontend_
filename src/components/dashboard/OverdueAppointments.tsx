'use client';

import { useState, useEffect } from 'react';
import { Appointment, Patient } from '@/types';
import { ApiService } from '@/lib/api';

export default function OverdueAppointments() {
    const [overdueAppointments, setOverdueAppointments] = useState<Appointment[]>([]);
    const [dismissed, setDismissed] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        Promise.all([ApiService.getAppointments(), ApiService.getPatients()]).then(([apps, pats]) => {
            setPatients(pats as any);
            const now = new Date();
            const overdue = (apps as any[]).filter(app => {
                const appointmentTime = new Date(app.appointmentDate);
                return appointmentTime < now; // no explicit status in backend; show past
            });
            setOverdueAppointments(overdue as any);
        });
    }, []);

    const getPatientName = (patientId: number) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? patient.fullName : 'Unknown Patient';
    };

    const handleStatusUpdate = (_appointmentId: string, _newStatus: 'completed' | 'cancelled' | 'rescheduled') => {};

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (dismissed) {
        return null;
    }

    if (overdueAppointments.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Overdue Appointments</h3>
                    <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <p className="text-gray-500">No overdue appointments.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Overdue Appointments</h3>
                <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
                {overdueAppointments.map(app => {
                    const hoursOverdue = Math.floor((Date.now() - new Date((app as any).appointmentDate).getTime()) / (1000 * 60 * 60));
                    return (
                        <div key={app.id} className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-semibold text-red-800">{(app as any).patient ? (app as any).patient.fullName : 'Unknown Patient'}</p>
                                    <p className="text-sm text-red-600">
                                        Scheduled: {formatDate(new Date((app as any).appointmentDate))} at {formatTime(new Date((app as any).appointmentDate))}
                                    </p>
                                    <p className="text-xs text-red-500 mt-1">
                                        Overdue by {hoursOverdue} hour{hoursOverdue !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => {}}
                                        className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
                                    >
                                        Reschedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
