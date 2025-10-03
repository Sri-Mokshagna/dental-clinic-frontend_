'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Patient, Appointment, TreatmentPlan, User } from '@/types';
import withAuth from '@/components/auth/withAuth';
import { formatDateTime } from '@/lib/utils';
// import DoctorNotesForm from '@/components/patients/DoctorNotesForm'; // Replaced with MedicalNotesManager
import AppointmentForm from '@/components/appointments/AppointmentForm';
import TreatmentPlanForm from '@/components/patients/TreatmentPlanForm';
import { ApiService } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import RescheduleForm from '@/components/appointments/RescheduleForm';
import PatientAttachments from '@/components/patients/details/PatientAttachments';
import PrintableSummary from '@/components/patients/details/PrintableSummary';
import MedicalNotesManager from '@/components/patients/MedicalNotesManager';
import PatientDetailsEditor from '@/components/patients/PatientDetailsEditor';
import { Prescription, Bill } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AppointmentNotesForm from '@/components/appointments/AppointmentNotesForm';
import AppointmentDetailModal from '@/components/appointments/AppointmentDetailModal';
import FileSharingModal from '@/components/admin/FileSharingModal';
import { PaperClipIcon } from '@heroicons/react/24/outline';

function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  
  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [showFileSharingModal, setShowFileSharingModal] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [params.id]);

  const handleGenerateSummary = () => {
    setIsGeneratingPdf(true);
  };

  useEffect(() => {
    if (isGeneratingPdf) {
      const generatePdf = async () => {
        const summaryElement = document.getElementById('printable-summary');
        if (summaryElement && patient) {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            let yPos = 15;

            const sections = summaryElement.querySelectorAll('.printable-section');

            for (const section of sections) {
                const canvas = await html2canvas(section as HTMLElement, { scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const imgHeight = (pdfWidth - 20) / ratio;

                if (yPos + imgHeight > pdfHeight - 20) {
                    pdf.addPage();
                    yPos = 15;
                }

                pdf.addImage(imgData, 'PNG', 10, yPos, pdfWidth - 20, imgHeight);
                yPos += imgHeight + 10;
            }

            pdf.save(`${patient.name}_summary.pdf`);
            setIsGeneratingPdf(false);
        }
      };
      generatePdf();
    }
  }, [isGeneratingPdf, patient]);

  const refreshAllData = useCallback(() => {
    Promise.all([
      ApiService.getPatient(String(patientId)),
      ApiService.getAppointments(),
      ApiService.getPrescriptionsByPatient(String(patientId)),
      ApiService.getBillsByPatient(String(patientId)),
    ])
      .then(([p, apps, presc, bills]) => {
        setPatient(p);
        const filteredApps = (apps as Appointment[])
          .filter(a => a.patient && a.patient.id === Number(patientId))
          .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
        setAppointments(filteredApps);
        setPrescriptions(presc as any);
        setBills(bills as any);
      })
      .catch(() => {})
  }, [patientId]);

  useEffect(() => {
    refreshAllData();
    return () => {};
  }, [refreshAllData]);
  
  const handleSaveNotes = () => {
    setEditingAppointmentId(null);
    refreshAllData();
  };

  
  const hasNotes = (_appointment: Appointment) => false;

  const isClinician = currentUser?.role === 'owner' || currentUser?.role === 'doctor';

  const financialSummary = useMemo(() => {
    const totalPaid = bills.reduce((acc, bill) => acc + (bill.amount || 0), 0);
    return { totalPaid } as any;
  }, [bills]);

  const handleWaiveFee = () => {
    return;
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setReschedulingAppointment(appointment);
  };

  const handleDeleteAppointment = (appointmentId: string | number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      ApiService.deleteAppointment(String(appointmentId)).then(refreshAllData).catch(() => {});
    }
  };


  if (!patient || !currentUser) return <div>Loading...</div>;

  return (
    <div className="p-4 md:p-6">
      {/* Patient Details Header */}
      <PatientDetailsEditor 
        patient={patient} 
        onUpdate={refreshAllData} 
      />
      
      <div className="flex flex-col gap-6">
          {/* Appointments Section */}
          <div className="bg-white p-4 shadow-md rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h2 className="text-xl font-bold mb-2 sm:mb-0">Appointments</h2>
                  <button onClick={() => setShowAppointmentForm(!showAppointmentForm)} className="bg-blue-500 text-white py-2 px-4 rounded-md text-sm w-full sm:w-auto">
                      {showAppointmentForm ? 'Close Form' : '+ New Appointment'}
                  </button>
              </div>
              {showAppointmentForm && patient && <AppointmentForm patient={patient} onSave={() => {setShowAppointmentForm(false); refreshAllData();}} onClose={() => setShowAppointmentForm(false)} />}
              
              <div className="mt-4 space-y-4">
              {appointments.map(app => (
                  <div key={app.id} className="bg-gray-50 p-4 shadow-sm rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => setSelectedAppointment(app)}>
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div>
                          <p className="font-bold">{formatDateTime(new Date(app.appointmentDate))}</p>
                      </div>
                  </div>
                  </div>
              ))}
              </div>
          </div>

          <MedicalNotesManager patient={patient} onUpdate={refreshAllData} />

          {/* Prescription Notes feature removed; managed under Medical Notes */}
          
          <PatientAttachments patient={patient} onUpdate={refreshAllData} />

          {/* Financials Section */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Financials</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Treatment Plans */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Treatment Plans & Estimates</h3>
                <div className="space-y-2">
                    {treatmentPlans.map(plan => (
                        <div key={plan.id} className="border-b last:border-b-0 py-2">
                            <p className="font-semibold">{plan.name} - ₹{plan.costEstimate}</p>
                            <p className="text-sm text-gray-600 capitalize">Status: {plan.status}</p>
                        </div>
                    ))}
                </div>
                {isClinician && <TreatmentPlanForm patientId={patient.id} onSave={refreshAllData} />}
              </div>

              {/* Right Side: Account Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Account Summary</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span className="text-green-600">₹{financialSummary.totalPaid.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor's Notes */}
          
      </div>
      
      {selectedAppointment && (
          <AppointmentDetailModal 
              appointment={selectedAppointment} 
              patient={patient}
              onClose={() => setSelectedAppointment(null)}
              onUpdate={refreshAllData} 
          />
      )}

      {/* Medical Notes Manager */}
      <MedicalNotesManager 
          patient={patient} 
          onUpdate={refreshAllData} 
      />

      {isGeneratingPdf && patient && (
        <div style={{ position: 'fixed', left: 0, top: 0, zIndex: -1, opacity: 0, width: '210mm' }}>
          <div id="printable-summary">
            <PrintableSummary 
              patient={patient}
              appointments={appointments}
              prescriptions={prescriptions}
              bills={bills}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button 
          onClick={() => setShowFileSharingModal(true)}
          className="dental-button btn-animate flex items-center"
        >
          <PaperClipIcon className="w-5 h-5 mr-2" />
          Share File with Patient
        </button>
        
        <button 
          onClick={handleGenerateSummary}
          className="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800"
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? 'Generating...' : 'Generate Summary'}
        </button>
      </div>

      {/* File Sharing Modal */}
      {showFileSharingModal && patient && (
        <FileSharingModal
          isOpen={showFileSharingModal}
          onClose={() => setShowFileSharingModal(false)}
          patientId={patient.id}
          patientName={patient.fullName}
          onFileShared={refreshAllData}
        />
      )}
    </div>
  );
}

export default withAuth(PatientDetailPage, ['owner', 'doctor', 'receptionist']);
