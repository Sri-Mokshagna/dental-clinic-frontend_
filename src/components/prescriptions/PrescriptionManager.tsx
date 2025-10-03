'use client';

import { useState, useEffect, useCallback } from 'react';
import { Prescription, Patient, User } from '@/types';
import { getCurrentUser } from '@/lib/session';
import { ApiService } from '@/lib/api';
import { generatePrescriptionPdf } from '@/lib/pdf-generator';
import PrescriptionForm from './PrescriptionForm';
import { formatDate } from '@/lib/utils';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface PrescriptionManagerProps {
  patient: Patient;
}

export default function PrescriptionManager({ patient }: PrescriptionManagerProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);

  const refreshPrescriptions = useCallback(() => {
    ApiService.getPrescriptionsByPatient(String(patient.id))
      .then((list) => {
        // Map backend date strings to Date objects
        const mapped = (list as any[]).map(p => ({ ...p, date: new Date(p.date) }));
        setPrescriptions(mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      });
  }, [patient.id]);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    ApiService.getUsersByRole('DOCTOR').then(setDoctors).catch(() => setDoctors([]));
    refreshPrescriptions();
    return () => {};
  }, [patient.id, refreshPrescriptions]);

  const handleSave = (prescription: Prescription) => {
    const payload: any = {
      patientId: patient.id,
      doctorId: prescription.doctorId,
      date: (prescription.date instanceof Date ? prescription.date.toISOString().split('T')[0] : prescription.date),
      medications: prescription.medications,
      notes: prescription.notes,
    };
    const action = editingPrescription
      ? ApiService.updatePrescription(String((editingPrescription as any).id), payload)
      : ApiService.createPrescription(payload);
    action.then(() => {
      setIsModalOpen(false);
      setEditingPrescription(undefined);
      refreshPrescriptions();
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      ApiService.deletePrescription(id).then(refreshPrescriptions);
    }
  };

  const handlePrint = (prescription: Prescription) => {
    const doctorUser = doctors.find(d => String(d.id) === String(prescription.doctorId));
    const doctor = doctorUser
      ? { id: String(doctorUser.id), userId: String(doctorUser.id), firstName: doctorUser.fullName.split(' ')[0] || doctorUser.fullName, lastName: doctorUser.fullName.split(' ').slice(1).join(' '), specialty: '', contact: { phone: doctorUser.phoneNumber, email: doctorUser.email }, availability: [], createdAt: new Date(), updatedAt: new Date() }
      : undefined;
    if (patient && doctor) {
      const doc = generatePrescriptionPdf(prescription, patient, doctor);
      doc.output('dataurlnewwindow');
    } else {
      alert('Could not find patient or doctor information for this prescription.');
    }
  };

  const openModal = (prescription?: Prescription) => {
    setEditingPrescription(prescription);
    setIsModalOpen(true);
  };
  
  const getDoctorName = (doctorId: string) => doctors.find(d => String(d.id) === String(doctorId))?.fullName || 'Unknown';
  const canManage = currentUser?.role === 'owner' || currentUser?.role === 'doctor' || currentUser?.role === 'ADMIN' || currentUser?.role === 'DOCTOR';

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Prescriptions</h2>
        {canManage && <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-md"><PlusIcon className="h-5 w-5"/>New Prescription</button>}
      </div>
      
      <div className="bg-white p-4 shadow rounded space-y-3">
        {prescriptions.length === 0 && <p>No prescriptions found for this patient.</p>}
        {prescriptions.map(rx => (
          <div key={rx.id} className="p-3 rounded-lg border bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">Prescription from {formatDate(new Date(rx.date))}</p>
                <p className="text-sm text-gray-600">by Dr. {getDoctorName(rx.doctorId)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handlePrint(rx)} className="text-sm text-blue-500 hover:underline">View/Print</button>
                {canManage && (
                  <>
                    <button onClick={() => openModal(rx)} className="text-gray-500 hover:text-blue-500"><PencilIcon className="h-4 w-4"/></button>
                    <button onClick={() => handleDelete(rx.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="h-4 w-4"/></button>
                  </>
                )}
              </div>
            </div>
            <ul className="list-disc pl-5 mt-2 text-sm">
              {rx.medications.map((med, i) => <li key={i}>{med.name} ({med.dosage}) - {med.frequency} for {med.duration}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {isModalOpen && <PrescriptionForm patientId={String(patient.id)} existingPrescription={editingPrescription} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
    </div>
  );
}
