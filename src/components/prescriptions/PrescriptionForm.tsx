'use client';

import { useState, useEffect } from 'react';
import { Prescription, Doctor } from '@/types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ApiService } from '@/lib/api';
import MedicationDropdown from './MedicationDropdown';

type Medication = Prescription['medications'][0];

interface PrescriptionFormProps {
  patientId: string;
  existingPrescription?: Prescription;
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
}

export default function PrescriptionForm({ patientId, existingPrescription, onSave, onCancel }: PrescriptionFormProps) {
  const [date, setDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  useEffect(() => {
    ApiService.getUsersByRole('DOCTOR').then((users) => {
      const mapped = (users as any[]).map(u => ({
        id: String(u.id),
        userId: String(u.id),
        firstName: (u.fullName || u.username || '').split(' ')[0] || (u.fullName || u.username || ''),
        lastName: (u.fullName || '').split(' ').slice(1).join(' '),
        specialty: '',
        contact: { phone: u.phoneNumber, email: u.email },
        availability: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      setDoctors(mapped);
      if (!existingPrescription && mapped.length > 0) {
        setSelectedDoctorId(mapped[0].id);
      }
    }).catch(() => setDoctors([]));
    if (existingPrescription) {
      setDate(new Date(existingPrescription.date));
      // Ensure medications is always an array
      setMedications(existingPrescription.medications && existingPrescription.medications.length > 0 ? existingPrescription.medications : [{ name: '', dosage: '', frequency: '', duration: '' }]);
      setNotes(existingPrescription.notes || '');
      setSelectedDoctorId(existingPrescription.doctorId);
    }
  }, [existingPrescription]);

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const addMedicationRow = () => setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  const removeMedicationRow = (index: number) => setMedications(medications.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filledMedications = medications.filter(m => m.name);
    if (!selectedDoctorId || filledMedications.length === 0) {
      alert('Please select a doctor and add at least one medication.');
      return;
    }

    try {
      const prescriptionData = {
        patientId: parseInt(patientId),
        doctorId: parseInt(selectedDoctorId),
        medications: filledMedications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        })),
        notes,
        date: date.toISOString().split('T')[0]
      };

      if (existingPrescription) {
        await ApiService.updatePrescription(existingPrescription.id, prescriptionData);
      } else {
        await ApiService.createPrescription(prescriptionData);
      }

      onSave({
        id: existingPrescription?.id || `rx-${Date.now()}`,
        patientId,
        doctorId: selectedDoctorId,
        date,
        medications: filledMedications,
        notes,
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
      alert('Error saving prescription. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{existingPrescription ? 'Edit Prescription' : 'New Prescription'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Doctor and Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">Prescribing Doctor</label>
              <select id="doctor" value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required>
                {doctors.map(doc => <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="date" value={date.toISOString().split('T')[0]} onChange={e => setDate(new Date(e.target.value))} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
            </div>
          </div>

          {/* Medications Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
            <div className="space-y-3">
              {medications.map((med, index) => {
                const isCustomFrequency = !['Once a day', 'Twice a day', 'Thrice a day', ''].includes(med.frequency);
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start p-2 border rounded-md">
                    <div className="md:col-span-2">
                      <MedicationDropdown
                        onMedicationSelect={(medication) => {
                          handleMedicationChange(index, 'name', medication.name);
                          if (medication.dosage) {
                            handleMedicationChange(index, 'dosage', medication.dosage);
                          }
                        }}
                        selectedMedications={medications}
                        placeholder="Search medications..."
                      />
                    </div>
                    <input type="text" placeholder="Dosage" value={med.dosage} onChange={e => handleMedicationChange(index, 'dosage', e.target.value)} className="p-2 border rounded" />
                    <div className="md:col-span-1">
                      <select 
                        value={isCustomFrequency ? 'Other' : med.frequency} 
                        onChange={e => handleMedicationChange(index, 'frequency', e.target.value === 'Other' ? '' : e.target.value)} 
                        className="p-2 border rounded w-full"
                      >
                          <option value="">Select Frequency</option>
                          <option>Once a day</option>
                          <option>Twice a day</option>
                          <option>Thrice a day</option>
                          <option value="Other">Other...</option>
                      </select>
                      {isCustomFrequency &&
                          <input type="text" placeholder="Custom frequency" value={med.frequency} onChange={e => handleMedicationChange(index, 'frequency', e.target.value)} className="p-2 border rounded w-full mt-2" />
                      }
                    </div>
                    <div className="flex items-center gap-2 md:col-span-1">
                      <input type="text" placeholder="Duration" value={med.duration} onChange={e => handleMedicationChange(index, 'duration', e.target.value)} className="p-2 border rounded w-full" />
                      <button type="button" onClick={() => removeMedicationRow(index)} disabled={medications.length <= 1} className="text-red-500 disabled:text-gray-300 flex-shrink-0"><TrashIcon className="h-5 w-5" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
            <button type="button" onClick={addMedicationRow} className="mt-2 flex items-center gap-2 text-sm text-blue-600"><PlusIcon className="h-5 w-5" />Add Medication</button>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onCancel} className="bg-gray-200 py-2 px-4 rounded-md">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md">Save Prescription</button>
          </div>
        </form>
      </div>
    </div>
  );
}
