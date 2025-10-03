'use client';

import { useEffect, useState } from 'react';
import { Appointment, Patient } from '@/types';
import { ApiService } from '@/lib/api';
import RescheduleForm from '@/components/appointments/RescheduleForm';
import Link from 'next/link';

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export default function TodayAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [apps, pats] = await Promise.all([
          ApiService.getAppointments(),
          ApiService.getPatients(),
        ]);
        const today = new Date();
        const todays = (apps as Appointment[]).filter(a => isSameDay(new Date(a.appointmentDate as any), today));
        setAppointments(todays.sort((a, b) => new Date(a.appointmentDate as any).getTime() - new Date(b.appointmentDate as any).getTime()));
        setPatients(pats as Patient[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getPatient = (id?: number) => patients.find(p => p.id === id);

  const refresh = async () => {
    setLoading(true);
    try {
      const [apps, pats] = await Promise.all([
        ApiService.getAppointments(),
        ApiService.getPatients(),
      ]);
      const today = new Date();
      const todays = (apps as Appointment[]).filter(a => isSameDay(new Date(a.appointmentDate as any), today));
      setAppointments(todays.sort((a, b) => new Date(a.appointmentDate as any).getTime() - new Date(b.appointmentDate as any).getTime()));
      setPatients(pats as Patient[]);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (app: Appointment) => {
    try {
      await ApiService.updateAppointment(String(app.id), { status: 'cancelled' });
      await refresh();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const completeAppointment = async (app: Appointment) => {
    try {
      await ApiService.updateAppointment(String(app.id), { status: 'completed' });
      await refresh();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  if (loading) {
    return <div className="p-4 bg-white shadow rounded">Loading today's appointments...</div>;
  }

  if (appointments.length === 0) {
    return <div className="p-4 bg-white shadow rounded">No appointments today.</div>;
  }

  return (
    <div className="bg-white p-4 shadow rounded">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-3 font-semibold">Time</th>
            <th className="p-3 font-semibold">Patient</th>
            <th className="p-3 font-semibold">Status</th>
            <th className="p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(app => {
            const p = getPatient(app.patient?.id);
            const time = new Date(app.appointmentDate as any).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const status = ((app as any).status || 'scheduled').toString().toLowerCase();
            const isCompleted = status === 'completed';
            const isCancelled = status === 'cancelled';
            return (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="p-3 whitespace-nowrap">{time}</td>
                <td className="p-3">{p?.fullName || 'Unknown'}</td>
                <td className={`p-3 capitalize ${isCompleted ? 'text-green-600' : isCancelled ? 'text-red-600' : ''}`}>
                  {status}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/patients/${p?.id || ''}`} className="text-blue-600 hover:underline">View</Link>
                    {!isCompleted && !isCancelled && (
                      <>
                        <button
                          onClick={() => completeAppointment(app)}
                          className="px-2 py-1 text-sm border border-green-600 text-green-700 rounded hover:bg-green-50"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => cancelAppointment(app)}
                          className="px-2 py-1 text-sm border border-red-600 text-red-700 rounded hover:bg-red-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setRescheduling(app)}
                          className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          Reschedule
                        </button>
                      </>
                    )}
                    {(isCompleted || isCancelled) && p?.id && (
                      <Link
                        href={`/dashboard/billing/patient/${p.id}`}
                        className="px-2 py-1 text-sm border border-purple-600 text-purple-700 rounded hover:bg-purple-50"
                      >
                        View Billing
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {rescheduling && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow max-w-lg w-full p-4">
            <RescheduleForm
              appointment={rescheduling}
              onSave={async () => { setRescheduling(null); await refresh(); }}
              onCancel={() => setRescheduling(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}