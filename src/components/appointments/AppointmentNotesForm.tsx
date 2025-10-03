'use client';

import { useState } from 'react';
import { Appointment } from '@/types';
import { updateAppointment } from '@/lib/data-manager';

interface AppointmentNotesFormProps {
  appointment: Appointment;
  onSave: () => void;
  onCancel?: () => void;
}

export default function AppointmentNotesForm({ appointment, onSave, onCancel }: AppointmentNotesFormProps) {
  const [complaints, setComplaints] = useState(appointment.complaints || '');
  const [treatment, setTreatment] = useState(appointment.treatmentDetails || '');

  const handleSave = () => {
    const updatedAppointment: Appointment = {
      ...appointment,
      complaints,
      treatmentDetails: treatment,
    };
    updateAppointment(updatedAppointment);
    onSave();
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-semibold mb-2">Clinical Notes for Appointment</h4>
      <div className="space-y-4">
        <div>
          <label htmlFor={`complaints-${appointment.id}`} className="block text-sm font-medium text-gray-700">Complaints</label>
          <textarea id={`complaints-${appointment.id}`} value={complaints} onChange={(e) => setComplaints(e.target.value)} rows={3} className="w-full p-2 border rounded"></textarea>
        </div>
        <div>
          <label htmlFor={`treatment-${appointment.id}`} className="block text-sm font-medium text-gray-700">Treatment Details</label>
          <textarea id={`treatment-${appointment.id}`} value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={3} className="w-full p-2 border rounded"></textarea>
        </div>
        <div className="flex gap-2">
            <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded">Save Notes</button>
            {onCancel && (
                <button onClick={onCancel} className="bg-gray-300 py-2 px-4 rounded">Cancel</button>
            )}
        </div>
      </div>
    </div>
  );
}


