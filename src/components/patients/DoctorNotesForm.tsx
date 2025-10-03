'use client';

import React, { useState } from 'react';
import { Patient, MedicalNote } from '@/types';
import { useData } from '@/context/DataContext';
import { formatDate } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import EditNoteForm from './EditNoteForm'; // We will create this component next

interface DoctorNotesFormProps {
  patient: Patient;
  onNoteAdded: () => void;
}

export default function DoctorNotesForm({ patient, onNoteAdded }: DoctorNotesFormProps) {
  const { updatePatient } = useData();
  const [complaints, setComplaints] = useState('');
  const [onExamination, setOnExamination] = useState('');
  const [treatment, setTreatment] = useState('');
  const [prescriptionTotal, setPrescriptionTotal] = useState('');
  const [editingNote, setEditingNote] = useState<MedicalNote | null>(null);
  const currentUser = getCurrentUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!complaints && !onExamination && !treatment) {
      alert('Please enter at least one field (Complaints, On Examination, or Treatment)');
      return;
    }

    const newNote: MedicalNote = {
      id: `mn-${Date.now()}`,
      date: new Date(),
      complaints,
      onExamination: onExamination || undefined,
      treatment,
      prescriptionTotal: prescriptionTotal ? parseFloat(prescriptionTotal) : undefined,
      doctorId: currentUser?.id || 'unknown',
    };

    const updatedHistory = patient.medicalHistory ? [...patient.medicalHistory, newNote] : [newNote];

    const updatedPatient = {
      ...patient,
      medicalHistory: updatedHistory,
    };

    updatePatient(patient.id, { medicalInfo: JSON.stringify(updatedHistory) }).then(() => {
      // In absence of a dedicated notes API, store serialized in medicalInfo or replace with actual endpoint later
    });
    setComplaints('');
    setOnExamination('');
    setTreatment('');
    setPrescriptionTotal('');
    onNoteAdded();
  };
  
  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedHistory = patient.medicalHistory.filter(note => note.id !== noteId);
      updatePatient(patient.id, { medicalInfo: JSON.stringify(updatedHistory) });
      onNoteAdded(); // This will trigger a refresh
    }
  };

  const handleSaveEdit = () => {
    setEditingNote(null);
    onNoteAdded(); // This will trigger a refresh
  };


  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Doctor&apos;s Notes</h3>
      <div className="max-h-48 overflow-y-auto mb-4 border p-2 rounded-md">
        {(patient.medicalHistory || []).map((note) => (
          <div key={note.id} className="mb-2 p-2 bg-gray-50 rounded group relative">
            <p className="text-sm font-bold">{formatDate(note.date)}</p>
            <p className="text-sm"><span className="font-semibold">Complaints:</span> {note.complaints}</p>
            {note.onExamination && <p className="text-sm"><span className="font-semibold">On Examination:</span> {note.onExamination}</p>}
            {note.prescriptionTotal && <p className="text-sm"><span className="font-semibold">Prescription Total:</span> ₹{note.prescriptionTotal}</p>}
            {note.treatment && <p className="text-sm"><span className="font-semibold">Treatment:</span> {note.treatment}</p>}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditingNote(note)} className="text-xs text-blue-500 hover:underline mr-2">Edit</button>
                <button onClick={() => handleDeleteNote(note.id)} className="text-xs text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label htmlFor="complaints" className="block text-sm font-medium text-gray-700">Complaints</label>
          <textarea id="complaints" value={complaints} onChange={(e) => setComplaints(e.target.value)} rows={1} className="w-full p-2 border rounded"></textarea>
        </div>
        <div className="mb-2">
          <label htmlFor="onExamination" className="block text-sm font-medium text-gray-700">On Examination</label>
          <textarea id="onExamination" value={onExamination} onChange={(e) => setOnExamination(e.target.value)} rows={2} className="w-full p-2 border rounded" placeholder="Enter examination findings..."></textarea>
        </div>
        <div className="mb-2">
          <label htmlFor="prescriptionTotal" className="block text-sm font-medium text-gray-700">Prescription Total (₹)</label>
          <input 
            id="prescriptionTotal" 
            type="number" 
            step="0.01" 
            value={prescriptionTotal} 
            onChange={(e) => setPrescriptionTotal(e.target.value)} 
            className="w-full p-2 border rounded" 
            placeholder="Enter prescription total amount"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="treatment" className="block text-sm font-medium text-gray-700">Treatment</label>
          <textarea id="treatment" value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2} className="w-full p-2 border rounded"></textarea>
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Add Note</button>
      </form>

      {editingNote && (
        <EditNoteForm
          note={editingNote}
          patient={patient}
          onSave={handleSaveEdit}
          onCancel={() => setEditingNote(null)}
        />
      )}
    </div>
  );
}
