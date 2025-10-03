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

interface PrescriptionNote {
  id: number;
  visitDate: string;
  complaints: string;
  examinationFindings: string;
  treatmentPlan: string;
  followUpInstructions: string;
  prescriptionTotal: number;
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
  prescriptionItems: PrescriptionItem[];
}

interface PrescriptionItem {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function PrescriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();
  const [prescriptions, setPrescriptions] = useState<PrescriptionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionNote | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadPrescriptions();
    }
  }, [authLoading]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/prescription-notes');
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
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
                Prescriptions & Medical Notes
              </h1>
              <p className="text-dental-muted mt-2">
                Manage patient prescriptions and medical records
              </p>
            </div>
            <button className="dental-button btn-animate flex items-center">
              <PlusIcon className="w-5 h-5 mr-2" />
              New Prescription
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
                <p className="text-sm font-medium text-dental-muted">Total Prescriptions</p>
                <p className="text-2xl font-bold text-dental-foreground">{prescriptions.length}</p>
              </div>
            </div>
          </div>

          <div className="dental-card p-6 card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-xl">
                <CurrencyDollarIcon className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">Total Value</p>
                <p className="text-2xl font-bold text-dental-foreground">
                  {formatCurrency(prescriptions.reduce((sum, p) => sum + p.prescriptionTotal, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="dental-card p-6 card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">This Month</p>
                <p className="text-2xl font-bold text-dental-foreground">
                  {prescriptions.filter(p => {
                    const prescriptionDate = new Date(p.visitDate);
                    const now = new Date();
                    return prescriptionDate.getMonth() === now.getMonth() && 
                           prescriptionDate.getFullYear() === now.getFullYear();
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
                  {new Set(prescriptions.map(p => p.patient.id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="dental-card overflow-hidden">
          <div className="px-6 py-4 border-b border-dental-border">
            <h2 className="text-lg font-semibold text-dental-foreground">Recent Prescriptions</h2>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardDocumentListIcon className="w-16 h-16 text-dental-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dental-foreground mb-2">No prescriptions found</h3>
              <p className="text-dental-muted">Get started by creating a new prescription.</p>
            </div>
          ) : (
            <div className="divide-y divide-dental-border">
              {prescriptions.map((prescription, index) => (
                <div 
                  key={prescription.id} 
                  className="p-6 hover:bg-dental-surface-dark transition-colors duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-semibold text-dental-foreground">
                          {prescription.patient.fullName}
                        </h3>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                          {formatCurrency(prescription.prescriptionTotal)}
                        </span>
                        <span className="text-sm text-dental-muted">
                          {formatDate(prescription.visitDate)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-dental-muted mb-1">Complaints</h4>
                          <p className="text-sm text-dental-foreground">
                            {prescription.complaints || 'No complaints recorded'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-dental-muted mb-1">Treatment Plan</h4>
                          <p className="text-sm text-dental-foreground">
                            {prescription.treatmentPlan || 'No treatment plan recorded'}
                          </p>
                        </div>
                      </div>

                      {prescription.prescriptionItems && prescription.prescriptionItems.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-dental-muted mb-2">Medications</h4>
                          <div className="space-y-2">
                            {prescription.prescriptionItems.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center justify-between text-sm">
                                <span className="text-dental-foreground">
                                  {item.medicationName} - {item.dosage}
                                </span>
                                <span className="text-dental-muted">
                                  {item.quantity}x {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                            ))}
                            {prescription.prescriptionItems.length > 3 && (
                              <p className="text-sm text-dental-muted">
                                +{prescription.prescriptionItems.length - 3} more medications
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center text-sm text-dental-muted">
                        <span>Dr. {prescription.doctor.fullName}</span>
                        <span className="mx-2">•</span>
                        <span>{prescription.patient.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
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

      {/* Prescription Detail Modal */}
      {showModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dental-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-dental-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-dental-foreground">
                  Prescription Details
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
                    <p className="font-medium text-dental-foreground">{selectedPrescription.patient.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dental-muted">Phone</p>
                    <p className="font-medium text-dental-foreground">{selectedPrescription.patient.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dental-muted">Visit Date</p>
                    <p className="font-medium text-dental-foreground">{formatDate(selectedPrescription.visitDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dental-muted">Doctor</p>
                    <p className="font-medium text-dental-foreground">Dr. {selectedPrescription.doctor.fullName}</p>
                  </div>
                </div>
              </div>

              {/* Medical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Complaints</h3>
                  <p className="text-dental-foreground">{selectedPrescription.complaints || 'No complaints recorded'}</p>
                </div>
                
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Examination Findings</h3>
                  <p className="text-dental-foreground">{selectedPrescription.examinationFindings || 'No findings recorded'}</p>
                </div>
                
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Treatment Plan</h3>
                  <p className="text-dental-foreground">{selectedPrescription.treatmentPlan || 'No treatment plan recorded'}</p>
                </div>
                
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Follow-up Instructions</h3>
                  <p className="text-dental-foreground">{selectedPrescription.followUpInstructions || 'No follow-up instructions'}</p>
                </div>
              </div>

              {/* Prescription Items */}
              {selectedPrescription.prescriptionItems && selectedPrescription.prescriptionItems.length > 0 && (
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-4">Prescription Items</h3>
                  <div className="space-y-4">
                    {selectedPrescription.prescriptionItems.map((item) => (
                      <div key={item.id} className="border border-dental-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-dental-foreground">{item.medicationName}</h4>
                          <span className="font-semibold text-primary-600">{formatCurrency(item.totalPrice)}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-dental-muted">Dosage</p>
                            <p className="text-dental-foreground">{item.dosage}</p>
                          </div>
                          <div>
                            <p className="text-dental-muted">Frequency</p>
                            <p className="text-dental-foreground">{item.frequency}</p>
                          </div>
                          <div>
                            <p className="text-dental-muted">Duration</p>
                            <p className="text-dental-foreground">{item.duration}</p>
                          </div>
                          <div>
                            <p className="text-dental-muted">Quantity</p>
                            <p className="text-dental-foreground">{item.quantity}</p>
                          </div>
                        </div>
                        {item.instructions && (
                          <div className="mt-2">
                            <p className="text-dental-muted text-sm">Instructions</p>
                            <p className="text-dental-foreground text-sm">{item.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-dental-border">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-dental-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(selectedPrescription.prescriptionTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="dental-card p-4">
                  <h3 className="text-lg font-semibold text-dental-foreground mb-3">Additional Notes</h3>
                  <p className="text-dental-foreground">{selectedPrescription.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
