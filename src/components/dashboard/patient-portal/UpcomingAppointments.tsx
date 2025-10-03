'use client';

import { useState, useEffect } from 'react';
import { Appointment, Doctor } from '@/types';
import { formatDateTime } from '@/lib/utils';

interface UpcomingAppointmentsProps {
  patientId: string;
}

export default function UpcomingAppointments({ patientId }: UpcomingAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const allAppointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]').map((a: Appointment) => ({ ...a, startTime: new Date(a.startTime) }));
    const upcoming = allAppointments
      .filter(a => a.patientId === patientId && a.status === 'scheduled' && a.startTime > new Date())
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    setAppointments(upcoming);

    const allDoctors: Doctor[] = JSON.parse(localStorage.getItem('doctors') || '[]');
    setDoctors(allDoctors);
  }, [patientId]);

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.lastName}` : 'Unknown Doctor';
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-bold mb-2">Upcoming Appointments</h3>
      {appointments.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {appointments.map(app => (
            <li key={app.id} className="py-3">
              <p className="font-semibold">{formatDateTime(app.startTime)}</p>
              <p className="text-sm text-gray-600">With: {getDoctorName(app.doctorId)}</p>
              <p className="text-sm text-gray-600">Status: {app.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">You have no upcoming appointments.</p>
      )}
    </div>
  );
}
