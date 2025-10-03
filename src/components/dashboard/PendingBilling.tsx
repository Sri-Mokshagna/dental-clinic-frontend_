'use client';

import { useState, useEffect } from 'react';
import { Appointment, Patient, Bill } from '@/types';
import { ApiService } from '@/lib/api';
import Link from 'next/link';

export default function PendingBilling() {
    const [unbilledAppointments, setUnbilledAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        Promise.all([ApiService.getAppointments(), ApiService.getPatients(), ApiService.getBills()]).then(([apps, pats, bills]) => {
            setPatients(pats as any);
            setBills(bills as any);
            const now = new Date();
            const unbilled = (apps as any[]).filter(app => {
                const appointmentTime = new Date(app.appointmentDate);
                const isPastTime = appointmentTime < now;
                const hasBilling = (bills as any[]).some((bill: any) => String(bill.appointmentId) === String(app.id));
                const isCancelled = (app.status || '').toString().toLowerCase() === 'cancelled';
                return isPastTime && !hasBilling && !isCancelled;
            });
            setUnbilledAppointments(unbilled as any);
        });
    }, []);

    const getPatientName = (patientId: number) => {
        const patient = patients.find(p => p.id === patientId);
        return patient ? patient.fullName : 'Unknown Patient';
    };

    const handleNoBillingNeeded = (_appointmentId: string) => {};

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

    if (unbilledAppointments.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Appointments Pending Billing</h3>
                    <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <p className="text-gray-500">No appointments are currently pending billing.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Appointments Pending Billing</h3>
                <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
                {unbilledAppointments.map(app => {
                    const isPastTime = new Date((app as any).appointmentDate) < new Date();
                    const statusColor = isPastTime ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200';
                    const statusText = isPastTime ? 'Past Time' : 'Scheduled';
                    
                    return (
                        <div key={app.id} className={`p-4 ${statusColor} border rounded-md`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">{(app as any).patient ? (app as any).patient.fullName : 'Unknown'}</p>
                                    <p className="text-sm text-gray-600">
                                        {formatDate(new Date((app as any).appointmentDate))} at {formatTime(new Date((app as any).appointmentDate))}
                                    </p>
                                    <p className={`text-xs mt-1 ${app.status === 'completed' ? 'text-blue-600' : 'text-yellow-600'}`}>
                                        Status: {statusText}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <Link href={`/dashboard/billing/patient/${(app as any).patient?.id ?? ''}`}>
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                                            Create Bill
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
