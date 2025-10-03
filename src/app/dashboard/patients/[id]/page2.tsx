'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Patient, Appointment, TreatmentPlan } from '@/types';
import withAuth from '@/components/auth/withAuth';
import { formatDateTime } from '@/lib/utils';
import DoctorNotesForm from '@/components/patients/DoctorNotesForm';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import TreatmentPlanForm from '@/components/patients/TreatmentPlanForm';
import { updateAppointment } from '@/lib/data-manager';
import RescheduleForm from '@/components/appointments/RescheduleForm';
import PatientAttachments from '@/components/patients/details/PatientAttachments';

function PatientDetailPage2() {
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);

  const refreshAllData = useCallback(() => {
    const allPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const currentPatient = allPatients.find((p: Patient) => p.id === patientId);
    if(currentPatient && currentPatient.attachments){
        currentPatient.attachments.forEach((att: { url: string; uploadedAt: Date; name: string }) => att.uploadedAt = new Date(att.uploadedAt));
    }
    setPatient(currentPatient);
    
    const allAppointments: Appointment[] = JSON.parse(localStorage.getItem('appointments') || '[]').map((a: Appointment) => ({...a, startTime: new Date(a.startTime)}));
    setAppointments(allAppointments.filter(a => a.patientId === patientId).sort((a,b) => b.startTime.getTime() - a.startTime.getTime()));
    
    const allTreatmentPlans = JSON.parse(localStorage.getItem('treatmentPlans') || '[]').map((p: TreatmentPlan) => ({...p, createdAt: new Date(p.createdAt)}));
    setTreatmentPlans(allTreatmentPlans.filter((p: TreatmentPlan) => p.patientId === patientId));
  }, [patientId]);

  useEffect(() => {
    refreshAllData();
    window.addEventListener('storage', refreshAllData);
    return () => window.removeEventListener('storage', refreshAllData);
  }, [patientId, refreshAllData]);
  
  const handleSaveNotes = () => {
    setEditingAppointmentId(null);
    refreshAllData();
  };

  const handleStatusChange = (appointmentId: string, status: 'completed' | 'cancelled') => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if(appointment){
      updateAppointment({...appointment, status});
      refreshAllData();
    }
  }
  
  const hasNotes = (appointment: Appointment) => !!(appointment.complaints || diagnosis || treatmentPlan);

  if (!patient) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* Patient Details */}
      <div className="mb-6">
          <h1 className="text-3xl font-bold">{patient.name}</h1>
          <div className="text-gray-600">
              <span>Age: {patient.age || 'N/A'}</span> | <span>Phone: {patient.contact.phone}</span>
          </div>
          {patient.healthConditions && <p className="mt-2"><strong>Health Conditions:</strong> {patient.healthConditions}</p>}
      </div>
      
      {/* Appointments Section */}
      <div className="my-6">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Appointments</h2>
            <button onClick={() => setShowAppointmentForm(!showAppointmentForm)} className="bg-blue-500 text-white py-2 px-4 rounded">
                {showAppointmentForm ? 'Close Form' : '+ New Appointment'}
            </button>
        </div>
        {showAppointmentForm && <AppointmentForm patientId={patient.id} onSave={() => {setShowAppointmentForm(false); refreshAllData();}} />}
        
        <div className="mt-4 space-y-4">
          {appointments.map(app => (
            <div key={app.id} className="bg-white p-4 shadow rounded">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="font-bold">{formatDateTime(app.startTime)}</p>
                      <p>Status: <span className="font-semibold">{app.status}</span></p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {app.status === 'scheduled' && (
                        <>
                            <button onClick={() => handleStatusChange(app.id, 'completed')} className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded">Mark Completed</button>
                            <button onClick={() => setReschedulingAppointment(app)} className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded">Reschedule</button>
                            <button onClick={() => handleStatusChange(app.id, 'cancelled')} className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded">Cancel</button>
                        </>
                    )}
                  </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                  {editingAppointmentId === app.id ? (
                      <DoctorNotesForm appointment={app} patient={patient} onSave={handleSaveNotes} onCancel={() => setEditingAppointmentId(null)} />
                  ) : (
                    <div>
                        {hasNotes(app) ? (
                            <div className="bg-gray-50 p-3 rounded relative">
                                <h4 className="font-semibold">Clinical Summary</h4>
                                <p><strong>Complaints:</strong> {app.complaints}</p>
                                <p><strong>Diagnosis:</strong> {app.diagnosis}</p>
                                <p><strong>Treatment:</strong> {app.treatmentPlan}</p>
                                <button onClick={() => setEditingAppointmentId(app.id)} className="absolute top-2 right-2 text-sm text-blue-500">Edit</button>
                            </div>
                        ) : (
                           (app.status !== 'cancelled' && !hasNotes(app)) && <DoctorNotesForm appointment={app} patient={patient} onSave={handleSaveNotes} />
                        )}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Attachments Section */}
      <PatientAttachments patient={patient} onUpdate={refreshAllData} />

      {/* Treatment Plans Section */}
      <div className="my-6">
        <h2 className="text-xl font-bold mb-2">Treatment Plans & Billing Estimates</h2>
        <div className="bg-white p-4 shadow rounded">
            {treatmentPlans.map(plan => (
                <div key={plan.id} className="border-b last:border-b-0 py-2">
                    <p className="font-semibold">{plan.name} - ₹{plan.costEstimate}</p>
                    <p className="text-sm text-gray-600">Status: {plan.status}</p>
                </div>
            ))}
            <TreatmentPlanForm patientId={patient.id} onSave={refreshAllData} />
        </div>
      </div>
      
      {reschedulingAppointment && (
          <RescheduleForm 
              appointment={reschedulingAppointment} 
              onSave={() => {setReschedulingAppointment(null); refreshAllData();}}
              onCancel={() => setReschedulingAppointment(null)} 
          />
      )}
    </div>
  );
}

export default withAuth(PatientDetailPage2, ['owner', 'doctor', 'receptionist']);
