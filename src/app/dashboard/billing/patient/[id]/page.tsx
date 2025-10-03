'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/auth/withAuth';
import {
  Bill,
  Patient,
  TreatmentPlan,
} from '@/types';
import { ApiService, ApiError } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import EditBillForm from '@/components/billing/EditBillForm';
import BillGenerator from '@/components/billing/BillGenerator';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function PatientBillingPage() {
  const { id: patientId } = useParams();
  const user = getCurrentUser();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Record payment is integrated inside BillGenerator now
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);

    try {
      // Always fetch patient first; if this fails, we can't render the page meaningfully
      const patientDetails = await ApiService.getPatient(String(patientId));
      setPatient(patientDetails);

      // Fetch bills, but do not fail the whole screen if this errors
      try {
        const patientBills = await ApiService.getBillsByPatient(String(patientId));
        const sorted = (patientBills as Bill[]).sort(
          (a, b) => new Date(a.issuedAt as any).getTime() - new Date(b.issuedAt as any).getTime()
        );
        setBills(sorted.reverse());
      } catch (billsErr) {
        // Keep patient visible even if bills fail
        setBills([]);
      }
    } catch (e: any) {
      const message = e instanceof ApiError ? e.message : 'Failed to load patient';
      setError(message);
      setPatient(null);
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refreshData();
    const handler = () => refreshData();
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refreshData]);

  const financialSummary = useMemo(() => {
    const totalPaid = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    return { totalPaid } as any;
  }, [bills]);

  const handlePaymentSave = () => {};

  const handleBillUpdate = () => {
    setEditingBill(null);
    refreshData();
  };

  const handleDeleteBill = (billId: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      ApiService.deleteBill(billId).then(refreshData).catch(() => {});
    }
  };

  const handleWaiveFee = () => {};

  const sendBillToWhatsApp = async (bill: Bill) => {
    if (!patient?.phoneNumber) {
      alert('Patient phone number not available');
      return;
    }

    try {
      setSendingWhatsApp(bill.id);
      const name = patient.fullName || 'Patient';
      const message = `Hello ${name}, your bill has been generated.\n\nBill Details:\nAmount: ₹${bill.amount}\nStatus: ${bill.status}\n\nPlease contact us for payment.`;
      
      await fetch('http://localhost:8080/api/whatsapp/send-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: patient.phoneNumber,
          message: message,
          fileName: `Bill-${bill.issuedAt}.pdf`,
          fileUrl: `${window.location.origin}/dashboard/billing/invoice/${bill.id}`
        })
      });
      
      alert('Bill sent to WhatsApp successfully!');
    } catch (error) {
      console.error('Error sending to WhatsApp:', error);
      alert('Failed to send bill to WhatsApp');
    } finally {
      setSendingWhatsApp(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading patient financials...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!patient) {
    return <div className="p-6">Patient not found.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Billing for {patient?.fullName}</h1>
        <div className="flex gap-2" />
      </div>

      {/* Bill Generator */}
      <BillGenerator 
        patient={patient} 
        onBillCreated={refreshData} 
      />

      {/* Record Payment removed; handled within BillGenerator flow */}

      {editingBill && (
        <EditBillForm
          bill={editingBill}
          onSave={handleBillUpdate}
          onCancel={() => setEditingBill(null)}
        />
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Paid Card */}
        <div className="bg-white p-4 shadow-md rounded-lg text-center">
          <h3 className="text-sm font-medium text-gray-500">Total Paid</h3>
          <p className="mt-1 text-3xl font-semibold text-green-600">
            ₹{financialSummary.totalPaid.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 font-semibold">Receipt ID</th>
                <th className="p-3 font-semibold">Amount Paid</th>
                <th className="p-3 font-semibold">Payment Date</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{bill.id}</td>
                  <td className="p-3">₹{bill.amount.toFixed(2)}</td>
                  <td className="p-3">{formatDate(bill.issuedAt as any)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/billing/invoice/${bill.id}`} className="text-sm bg-gray-200 text-gray-700 py-1 px-3 rounded-md">
                        View Receipt
                      </Link>
                      {patient?.phoneNumber && (
                        <button 
                          onClick={() => sendBillToWhatsApp(bill)}
                          disabled={sendingWhatsApp === bill.id}
                          className="text-sm bg-green-600 text-white py-1 px-3 rounded-md disabled:opacity-60 hover:bg-green-700"
                        >
                          {sendingWhatsApp === bill.id ? 'Sending...' : 'Send to WhatsApp'}
                        </button>
                      )}
                      {user?.role === 'owner' && (
                        <>
                          <button onClick={() => setEditingBill(bill)} className="p-1 text-blue-600 hover:text-blue-800">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteBill(bill.id)} className="p-1 text-red-600 hover:text-red-800">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bills.length === 0 && <p className="text-center text-gray-500 py-4">No payments recorded for this patient.</p>}
      </div>
    </div>
  );
}

export default withAuth(PatientBillingPage, ['owner', 'doctor', 'staff']);
