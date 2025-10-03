'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import LoadingSpinner, { PageLoader, CardSkeleton } from '@/components/common/LoadingSpinner';
import { 
  ClipboardDocumentListIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MedicalNote {
  id: number;
  visitDate: string;
  complaints: string;
  onExamination: string;
  treatment: string;
  notes: string;
  patient: {
    id: number;
    fullName: string;
    phoneNumber: string;
  };
  doctor: {
    id: number;
    fullName: string;
    username: string;
  };
  prescriptionItems?: Array<{
    id: number;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
}

export default function MedicalNotesPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();
  const [medicalNotes, setMedicalNotes] = useState<MedicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<MedicalNote | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadMedicalNotes();
    }
  }, [authLoading]);

  const loadMedicalNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/prescription-notes');
      if (response.ok) {
        const data = await response.json();
        setMedicalNotes(data);
      }
    } catch (error) {
      console.error('Error loading medical notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (authLoading || dataLoading) {
    return <PageLoader />;
  }

  if (!user || (user.role !== 'owner' && user.role !== 'doctor')) {
    return (
      <div className="min-h-screen bg-dental-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dental-foreground mb-4">Access Denied</h1>
          <p className="text-dental-muted">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dental-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dental-foreground flex items-center">
                <ClipboardDocumentListIcon className="w-8 h-8 text-primary-600 mr-3" />
                Medical Notes
              </h1>
              <p className="text-dental-muted mt-2">
                Manage patient medical records and prescriptions
              </p>
            </div>
            <button className="dental-button btn-animate flex items-center">
              <PlusIcon className="w-5 h-5 mr-2" />
              New Medical Note
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="dental-card p-6 card-hover animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-xl">
                <ClipboardDocumentListIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">Total Notes</p>
                <p className="text-2xl font-bold text-dental-foreground">{medicalNotes.length}</p>
              </div>
            </div>
          </div>

          {/* Removed monetary totals as requested */}

          <div className="dental-card p-6 card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">This Month</p>
                <p className="text-2xl font-bold text-dental-foreground">
                  {medicalNotes.filter(note => {
                    const noteDate = new Date(note.visitDate);
                    const now = new Date();
                    return noteDate.getMonth() === now.getMonth() && 
                           noteDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="dental-card p-6 card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <UserIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">Unique Patients</p>
                <p className="text-2xl font-bold text-dental-foreground">
                  {new Set(medicalNotes.map(note => note.patient.id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Notes List */}
        <div className="dental-card overflow-hidden">
          <div className="px-6 py-4 border-b border-dental-border">
            <h2 className="text-lg font-semibold text-dental-foreground">Recent Medical Notes</h2>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : medicalNotes.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardDocumentListIcon className="w-16 h-16 text-dental-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dental-foreground mb-2">No medical notes found</h3>
              <p className="text-dental-muted">Get started by creating a new medical note.</p>
            </div>
          ) : (
            <div className="divide-y divide-dental-border">
              {medicalNotes.map((note, index) => (
                <div 
                  key={note.id} 
                  className="p-6 hover:bg-dental-surface-dark transition-colors duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-semibold text-dental-foreground">
                          {note.patient.fullName}
                        </h3>
                        <span className="text-sm text-dental-muted">
                          {formatDate(note.visitDate)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-dental-muted mb-1">Complaints</h4>
                          <p className="text-sm text-dental-foreground">
                            {note.complaints || 'No complaints recorded'}
                          </p>
                        </div>
                        {note.prescriptionItems && note.prescriptionItems.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-dental-muted mb-1">Medications</h4>
                            <ul className="list-disc pl-5 text-sm text-dental-foreground">
                              {note.prescriptionItems.map(item => (
                                <li key={item.id}>
                                  {item.medicationName} — {item.dosage}, {item.frequency}, {item.duration}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-dental-muted">
                        <span>Dr. {note.doctor.fullName}</span>
                        <span className="mx-2">•</span>
                        <span>{note.patient.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedNote(note);
                          setShowModal(true);
                        }}
                        className="p-2 text-dental-muted hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-dental-muted hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors duration-200">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-dental-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Medical Note Detail Modal */}
      {showModal && selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dental-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-dental-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-dental-foreground">
                  Medical Note Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-dental-muted hover:text-dental-foreground hover:bg-dental-surface-dark rounded-lg transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="dental-card p-4">
                <h3 className="text-lg font-semibold text-dental-foreground mb-3">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-dental-muted">Name</p>
                    <p className="font-medium text-dental-foreground">{selectedNote.patient.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dental-muted">Phone</p>
                    <p className="font-medium text-dental-foreground">{selectedNote.patient.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dental-muted">Visit Date</p>
                    <p className="font-medium text-dental-foreground">{formatDate(selectedNote.visitDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dental-muted">Doctor</p>
                    <p className="font-medium text-dental-foreground">Dr. {selectedNote.doctor.fullName}</p>
                  </div>
                </div>
              </div>

              {/* Medical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Complaints</h3>
                  <p className="text-dental-foreground">{selectedNote.complaints || 'No complaints recorded'}</p>
                </div>
                
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Examination Findings</h3>
                  <p className="text-dental-foreground">{selectedNote.onExamination || 'No findings recorded'}</p>
                </div>
                
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Treatment</h3>
                  <p className="text-dental-foreground">{selectedNote.treatment || 'No treatment recorded'}</p>
                </div>
                
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Prescription</h3>
                  <p className="text-dental-foreground">{selectedNote.prescription || 'No prescription recorded'}</p>
                </div>
              </div>

              {/* Removed Prescription Total section */}

              {/* Medications */}
              {selectedNote.prescriptionItems && selectedNote.prescriptionItems.length > 0 && (
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Medications</h3>
                  <div className="space-y-2">
                    {selectedNote.prescriptionItems.map(item => (
                      <div key={item.id} className="text-sm text-dental-foreground">
                        {item.medicationName} — {item.dosage}, {item.frequency}, {item.duration}
                        {item.instructions && <span className="text-dental-muted"> • {item.instructions}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedNote.notes && (
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Additional Notes</h3>
                  <p className="text-dental-foreground">{selectedNote.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
