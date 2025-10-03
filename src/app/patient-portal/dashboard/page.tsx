'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate, formatDateTime } from '@/lib/utils';
import { ApiService } from '@/lib/api';

interface PatientData {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  age: number;
  gender: string;
  address: string;
  medicalInfo: string;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  treatmentDetails: string;
  treatmentCost: number;
  doctor?: { fullName: string };
}

interface Bill {
  id: string;
  amount: number;
  status: string;
  issuedAt: string;
}

interface MedicalNote {
  id: string;
  date: string;
  complaints: string;
  diagnosis: string;
  treatment?: string;
}

export default function PatientPortalDashboard() {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [medicalNotes, setMedicalNotes] = useState<MedicalNote[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'bills' | 'medicalNotes' | 'reports'>('overview');
  const router = useRouter();

  useEffect(() => {
    const storedPatient = localStorage.getItem('patientData');
    if (!storedPatient) {
      router.push('/patient-portal/login');
      return;
    }

    const patient = JSON.parse(storedPatient);
    setPatientData(patient);
    loadPatientData(patient.phoneNumber, patient.id);
  }, [router]);

  const loadPatientData = async (phoneNumber: string, patientId: string) => {
   
// Load bills (normalize dates + uppercase status + sort latest first)
const patientBillsRaw = await ApiService.getBillsByPatient(patientId);
const patientBills = (patientBillsRaw || []).map((b: any) => ({
  ...b,
  // convert LocalDate strings to Date objects (so formatDate works)
  issuedAt: b.issuedAt ? new Date(b.issuedAt) : null,
  paymentDate: b.paymentDate ? new Date(b.paymentDate) : null,
  // normalize status to uppercase to match backend values like "PAID"
  status: b.status ? String(b.status).toUpperCase() : 'UNPAID',
}));
patientBills.sort((a: any, b: any) => (b.issuedAt?.getTime?.() ?? 0) - (a.issuedAt?.getTime?.() ?? 0));
setBills(patientBills);
    try {
      setLoading(true);

      // ✅ Patient profile
      const profile = await ApiService.getPatientByPhone(phoneNumber);
      setPatientData(profile);

      // ✅ Reports / files
      
      const files = await ApiService.getReportsByPatient(patientId);
      setReports(files || []);

      // ✅ Medical notes
      const notes = await ApiService.getPatientMedicalNotes(patientId);
      setMedicalNotes(notes || []);

      // ✅ Appointments
      const patientAppointments = await ApiService.getPatientAppointments(patientId);
      setAppointments(patientAppointments || []);

      // ✅ Bills
      const patientBills = await ApiService.getBillsByPatient(patientId);
      setBills(patientBills || []);

    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('patientData');
    router.push('/patient-portal/login');
  };

  if (!patientData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const totalBilled = bills.reduce((sum, bill) => sum + (Number(bill.amount ?? 0)), 0);
  const totalPaid = bills
    .filter(b => String(b.status ?? '').toUpperCase() === 'PAID')
    .reduce((sum, bill) => sum + (Number(bill.amount ?? 0)), 0);
  // amount due = total billed minus paid (also matches unpaid sum)
  const amountDue = totalBilled - totalPaid;
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {patientData.fullName}</h1>
              <p className="text-gray-600">Patient Portal Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'appointments', name: 'Appointments' },
                { id: 'bills', name: 'Bills & Payments' },
                { id: 'medicalNotes', name: 'Medical Notes' },
                { id: 'reports', name: 'Reports' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold">Account Overview</h2>
                  {/* Patient Info + Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {patientData.fullName}</p>
                        <p><strong>Phone:</strong> {patientData.phoneNumber}</p>
                        <p><strong>Email:</strong> {patientData.email || 'N/A'}</p>
                        <p><strong>Age:</strong> {patientData.age}</p>
                        <p><strong>Gender:</strong> {patientData.gender || 'N/A'}</p>
                        <p><strong>Address:</strong> {patientData.address || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Medical Summary</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900">Total Appointments</h4>
                          <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900">Total Billed</h4>
                          <p className="text-2xl font-bold text-green-600">₹{totalBilled.toFixed(2)}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-900">Amount Due</h4>
                          <p className="text-2xl font-bold text-red-600">₹{amountDue.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Appointment History</h2>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                    {appointments.map(appt => (
                      <div key={appt.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            {/* Date */}
                            <h3 className="font-semibold text-lg">{formatDateTime(new Date(appt.appointmentDate))}</h3>

                            {/* Treatment details */}
                            <p className="text-gray-600">{appt.treatmentDetails}</p>
                  
                            {/* Doctor */}
                            {appt.doctor && (
                              <p className="text-sm text-gray-500">
                                <strong>Doctor:</strong> {appt.doctor.fullName}
                              </p>
                            )}
                  
                            {/* Patient */}
                            {appt.patient && (
                              <p className="text-sm text-gray-500">
                                <strong>Patient:</strong> {appt.patient.fullName}
                              </p>
                            )}
                  
                            {/* Staff */}
                            {appt.staff && (
                              <p className="text-sm text-gray-500">
                                <strong>Staff:</strong> {appt.staff.fullName}
                              </p>
                            )}
                  
                            {/* Status */}
                            <p className="text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  appt.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : appt.status === 'cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {appt.status}
                              </span>
                            </p>
                          </div>
            
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  ) : <p className="text-gray-500">No appointments found</p>}
                </div>
              )}

{activeTab === 'bills' && (
  <div>
    <h2 className="text-xl font-bold mb-4">Bills & Payments</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <h3 className="font-semibold text-blue-900">Total Billed</h3>
        <p className="text-2xl font-bold text-blue-600">₹{totalBilled.toFixed(2)}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <h3 className="font-semibold text-green-900">Total Paid</h3>
        <p className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</p>
      </div>
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <h3 className="font-semibold text-red-900">Amount Due</h3>
        <p className="text-2xl font-bold text-red-600">₹{amountDue.toFixed(2)}</p>
      </div>
    </div>

    {bills.length > 0 ? (
      <div className="space-y-4">
        {bills.map(bill => (
          <div key={bill.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex-1">
              <h3 className="font-semibold">Bill #{bill.id}</h3>
              <p className="text-gray-600">{formatDate(bill.issuedAt)}</p>

              <p className="text-sm text-gray-700 mt-2">
                <strong>Patient:</strong> {bill.patient?.fullName ?? 'N/A'}
              </p>

              {bill.items && bill.items.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Items:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {bill.items.map((it: any, idx: number) => (
                      <li key={idx}>
                        {it.description} — ₹{Number(it.cost ?? 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {bill.paymentMethod && (
                <p className="text-sm text-gray-500 mt-2">
                  <strong>Payment Method:</strong> {bill.paymentMethod}
                </p>
              )}
              {bill.paymentDate && (
                <p className="text-sm text-gray-500">
                  <strong>Paid on:</strong> {formatDate(bill.paymentDate)}
                </p>
              )}
            </div>

            <div className="text-right mt-4 md:mt-0 md:ml-6">
              <p className="font-semibold text-lg">₹{Number(bill.amount ?? 0).toFixed(2)}</p>

              <span className={`px-2 py-1 rounded text-xs font-medium mt-2 inline-block ${
                bill.status === 'PAID' ? 'bg-green-100 text-green-800'
                  : bill.status === 'OVERDUE' ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {bill.status}
              </span>

              <div className="mt-3 space-x-2">
                <button
                  onClick={() => handleDownloadBill(bill)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No bills found</p>
    )}
  </div>
)}


              {activeTab === 'medicalNotes' && (
  <div>
    <h2 className="text-xl font-bold mb-4">Medical Notes</h2>
    {medicalNotes.length > 0 ? (
      <div className="space-y-6">
        {medicalNotes.map(note => (
          <div key={note.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-lg font-semibold mb-4">{formatDate(note.visitDate)}</h3>
            
            <div className="space-y-2">
              <p><strong>Complaints:</strong> {note.complaints}</p>
              <p><strong>Examination Findings:</strong> {note.examinationFindings}</p>
              <p><strong>Treatment Plan:</strong> {note.treatmentPlan}</p>
              <p><strong>Additional Notes:</strong> {note.notes}</p>
              <p><strong>Created At:</strong> {formatDate(note.createdAt)}</p>
              {note.updatedAt && <p><strong>Updated At:</strong> {formatDate(note.updatedAt)}</p>}
            </div>

            {/* Prescription Items */}
            {note.prescriptionItems && note.prescriptionItems.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-2">Prescription Items:</h4>
                <div className="space-y-4">
                  {note.prescriptionItems.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="border rounded-md p-4 bg-gray-50"
                    >
                      <p><strong>Medication Name:</strong> {item.medicationName}</p>
                      <p><strong>Dosage:</strong> {item.dosage}</p>
                      <p><strong>Frequency:</strong> {item.frequency}</p>
                      <p><strong>Duration:</strong> {item.duration} days</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <p><strong>Unit Price:</strong> ₹{item.unitPrice.toFixed(2)}</p>
                      <p><strong>Total Price:</strong> ₹{item.totalPrice.toFixed(2)}</p>
                      {item.instructions && (
                        <p><strong>Instructions:</strong> {item.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No medical notes found</p>
    )}
  </div>
)}

              {activeTab === 'reports' && (
  <div>
    <h2 className="text-xl font-bold mb-4">Reports & Files</h2>
    {reports.length > 0 ? (
      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{report.fileName}</h3>
              <p className="text-gray-500 text-sm">
                Uploaded: {report.uploadedAt ? formatDate(report.uploadedAt) : "N/A"}
              </p>
            </div>
            <a
              href={report.downloadUrl}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No reports available</p>
    )}
  </div>
)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
