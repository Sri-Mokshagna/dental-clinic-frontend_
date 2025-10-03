'use client';

import React, { useState } from 'react';
import { Patient, MedicalNote } from '@/types';
import { updatePatient } from '@/lib/data-manager';

interface EditNoteFormProps {
  note: MedicalNote;
  patient: Patient;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditNoteForm({ note, patient, onSave, onCancel }: EditNoteFormProps) {
  const [complaints, setComplaints] = useState(note.complaints);
  const [onExamination, setOnExamination] = useState(note.onExamination || '');
  const [treatment, setTreatment] = useState(note.treatment || '');
  const [prescriptionTotal, setPrescriptionTotal] = useState(note.prescriptionTotal?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedNote = { ...note, complaints, onExamination: onExamination || undefined, treatment, prescriptionTotal: prescriptionTotal ? parseFloat(prescriptionTotal) : undefined };
    const updatedHistory = patient.medicalHistory.map(n => n.id === note.id ? updatedNote : n);
    const updatedPatient = { ...patient, medicalHistory: updatedHistory };
    updatePatient(updatedPatient);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label htmlFor="edit-complaints" className="block text-sm font-medium">Complaints</label>
            <textarea id="edit-complaints" value={complaints} onChange={(e) => setComplaints(e.target.value)} rows={2} className="w-full p-2 border rounded" />
          </div>
          <div className="mb-2">
            <label htmlFor="edit-onExamination" className="block text-sm font-medium">On Examination</label>
            <textarea id="edit-onExamination" value={onExamination} onChange={(e) => setOnExamination(e.target.value)} rows={2} className="w-full p-2 border rounded" placeholder="Enter examination findings..." />
          </div>
          <div className="mb-2">
            <label htmlFor="edit-prescriptionTotal" className="block text-sm font-medium">Prescription Total (₹)</label>
            <input 
              id="edit-prescriptionTotal" 
              type="number" 
              step="0.01" 
              value={prescriptionTotal} 
              onChange={(e) => setPrescriptionTotal(e.target.value)} 
              className="w-full p-2 border rounded" 
              placeholder="Enter prescription total amount"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="edit-treatment" className="block text-sm font-medium">Treatment</label>
            <textarea id="edit-treatment" value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={3} className="w-full p-2 border rounded" />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
