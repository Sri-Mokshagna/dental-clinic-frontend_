'use client';

import { useState, useEffect, useCallback } from 'react';
import { Patient, User } from '@/types';
import { ApiService } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { formatDateTime } from '@/lib/utils';

interface PrescriptionNote {
  id: string;
  visitDate: string;
  complaints: string;
  examinationFindings?: string;
  treatmentPlan?: string;
  // prescription and totals removed; keep medications
  notes?: string;
  doctorId: string;
  doctorName?: string;
  prescriptionItems?: any[];
}

interface MedicalNotesManagerProps {
  patient: Patient;
  onUpdate: () => void;
}

export default function MedicalNotesManager({ patient, onUpdate }: MedicalNotesManagerProps) {
  const [notes, setNotes] = useState<PrescriptionNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<PrescriptionNote | null>(null);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    complaints: '',
    examinationFindings: '',
    treatmentPlan: '',
    notes: ''
  });

  const [medications, setMedications] = useState<Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>>([{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);

  // Master list of medications added by admin
  const [medicationCatalog, setMedicationCatalog] = useState<Array<{
    id: number;
    name: string;
    dosage?: string;
    type?: string;
  }>>([]);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadNotes();
    // Load available medications for dropdown
    fetch('http://localhost:8080/api/medications')
      .then(res => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          setMedicationCatalog(data.map((m: any) => ({ id: m.id, name: m.name, dosage: m.dosage, type: m.type })));
        }
      })
      .catch(() => setMedicationCatalog([]));
  }, [patient.id]);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetch(`http://localhost:8080/api/prescription-notes/patient/${patient.id}`);
      if (data.ok) {
        const prescriptionNotes = await data.json();
        setNotes(prescriptionNotes);
      }
    } catch (error) {
      console.error('Error loading prescription notes:', error);
    } finally {
      setLoading(false);
    }
  }, [patient.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const noteData = {
        patientId: patient.id,
        doctorId: currentUser.id,
        complaints: formData.complaints,
        examinationFindings: formData.examinationFindings,
        treatmentPlan: formData.treatmentPlan,
        notes: formData.notes,
        prescriptionItems: medications
          .filter(m => m.medicationName.trim())
          .map(m => ({
            medicationName: m.medicationName,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: m.instructions || ''
          }))
      };

      const response = await fetch('http://localhost:8080/api/prescription-notes', {
        method: editingNote ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingNote ? { ...noteData, id: editingNote.id } : noteData),
      });

      if (response.ok) {
        setFormData({ complaints: '', examinationFindings: '', treatmentPlan: '', notes: '' });
        setMedications([{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
        setShowForm(false);
        setEditingNote(null);
        await loadNotes();
        onUpdate();
      } else {
        throw new Error('Failed to save prescription note');
      }
    } catch (error) {
      console.error('Error saving prescription note:', error);
      alert('Error saving prescription note');
    }
  };

  const handleEdit = (note: PrescriptionNote) => {
    setEditingNote(note);
    setFormData({
      complaints: note.complaints,
      examinationFindings: note.examinationFindings || '',
      treatmentPlan: note.treatmentPlan || '',
      notes: note.notes || ''
    });
    setMedications(
      (note.prescriptionItems && note.prescriptionItems.length > 0)
        ? note.prescriptionItems.map((i: any) => ({
            medicationName: i.medicationName || '',
            dosage: i.dosage || '',
            frequency: i.frequency || '',
            duration: i.duration || '',
            instructions: i.instructions || ''
          }))
        : [{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    );
    setShowForm(true);
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this prescription note?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/prescription-notes/${noteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await loadNotes();
        onUpdate();
      } else {
        throw new Error('Failed to delete prescription note');
      }
    } catch (error) {
      console.error('Error deleting prescription note:', error);
      alert('Error deleting prescription note');
    }
  };

  const resetForm = () => {
    setFormData({ complaints: '', examinationFindings: '', treatmentPlan: '', notes: '' });
    setMedications([{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setShowForm(false);
    setEditingNote(null);
  };

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Medical Notes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-600"
        >
          + Add Medical Note
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {editingNote ? 'Edit Medical Note' : 'Add Medical Note'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complaints *
                </label>
                <textarea
                  value={formData.complaints}
                  onChange={(e) => setFormData(prev => ({ ...prev, complaints: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Examination Findings
                </label>
                <textarea
                  value={formData.examinationFindings}
                  onChange={(e) => setFormData(prev => ({ ...prev, examinationFindings: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Enter examination findings..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Plan
                </label>
                <textarea
                  value={formData.treatmentPlan}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Enter treatment plan..."
                />
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Medications</label>
                  <button
                    type="button"
                    onClick={() => setMedications(prev => [...prev, { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }])}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Tablet
                  </button>
                </div>
                <div className="space-y-2">
                  {medications.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <select
                        value={m.medicationName}
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          const selected = medicationCatalog.find(mc => mc.name === selectedName);
                          setMedications(prev => prev.map((x,i)=> i===idx? { 
                            ...x, 
                            medicationName: selectedName,
                            // prefill dosage from catalog if present and field is empty
                            dosage: x.dosage || (selected?.dosage || '')
                          }: x))
                        }}
                        className="p-2 border rounded-md"
                      >
                        <option value="">Select tablet…</option>
                        {medicationCatalog.map(med => (
                          <option key={med.id} value={med.name}>{med.name}</option>
                        ))}
                      </select>
                      <input
                        value={m.dosage}
                        onChange={(e) => setMedications(prev => prev.map((x,i)=> i===idx? { ...x, dosage: e.target.value }: x))}
                        className="p-2 border rounded-md"
                        placeholder="Dosage"
                      />
                      <input
                        value={m.frequency}
                        onChange={(e) => setMedications(prev => prev.map((x,i)=> i===idx? { ...x, frequency: e.target.value }: x))}
                        className="p-2 border rounded-md"
                        placeholder="Frequency"
                      />
                      <input
                        value={m.duration}
                        onChange={(e) => setMedications(prev => prev.map((x,i)=> i===idx? { ...x, duration: e.target.value }: x))}
                        className="p-2 border rounded-md"
                        placeholder="Duration"
                      />
                      <div className="flex gap-2">
                        <input
                          value={m.instructions}
                          onChange={(e) => setMedications(prev => prev.map((x,i)=> i===idx? { ...x, instructions: e.target.value }: x))}
                          className="p-2 border rounded-md flex-1"
                          placeholder="Instructions (optional)"
                        />
                        <button
                          type="button"
                          onClick={() => setMedications(prev => prev.filter((_, i) => i !== idx))}
                          className="px-3 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                          disabled={medications.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Enter additional notes..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingNote ? 'Update Note' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="bg-white p-4 shadow rounded-lg">
        {loading ? (
          <div className="text-center py-4">Loading medical notes...</div>
        ) : notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {formatDateTime(new Date(note.visitDate))}
                    </h4>
                    {note.doctorName && (
                      <p className="text-sm text-gray-600">Dr. {note.doctorName}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Complaints:</strong> {note.complaints}
                  </div>
                  {note.examinationFindings && (
                    <div>
                      <strong>Examination Findings:</strong> {note.examinationFindings}
                    </div>
                  )}
                  {note.treatmentPlan && (
                    <div>
                      <strong>Treatment Plan:</strong> {note.treatmentPlan}
                    </div>
                  )}
                  {note.prescriptionItems && note.prescriptionItems.length > 0 && (
                    <div>
                      <strong>Medications:</strong>
                      <ul className="list-disc pl-5">
                        {note.prescriptionItems.map((i: any, k: number) => (
                          <li key={k}>{i.medicationName} — {i.dosage}, {i.frequency}, {i.duration}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {note.notes && (
                    <div>
                      <strong>Additional Notes:</strong> {note.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No medical notes recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
