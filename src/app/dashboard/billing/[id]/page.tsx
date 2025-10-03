'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bill, Patient, Appointment } from '@/types';
import withAuth from '@/components/auth/withAuth';
import { formatDate, formatDateTime } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import { ApiService } from '@/lib/api';
import { generateInvoicePdf } from '@/lib/pdf-generator';
import EditBillForm from '@/components/billing/EditBillForm';

function InvoicePage() {
    const params = useParams();
    const router = useRouter();
    const billId = params.id as string;
    const [bill, setBill] = useState<Bill | undefined>(undefined);
    const [patient, setPatient] = useState<Patient | undefined>(undefined);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const currentUser = getCurrentUser();

    useEffect(() => {
        if (!billId) return;
        ApiService.getBill(String(billId)).then((b) => {
            setBill(b);
            // Prefer nested patient object if present
            if ((b as any).patient && (b as any).patient.id) {
                setPatient((b as any).patient);
            } else if ((b as any).patientId) {
                ApiService.getPatient(String((b as any).patientId)).then(setPatient).catch(() => setPatient(undefined));
            } else {
                setPatient(undefined);
            }
        }).catch(() => setBill(undefined));
    }, [billId]);
    
    const handleMarkAsPaid = () => {}
    
    const handleDelete = () => {
        if (!bill || !currentUser || currentUser.role !== 'owner') {
            alert('You do not have permission to delete this bill.');
            return;
        }

        if(window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')){
            ApiService.deleteBill(String(billId)).then(() => {
                alert('Bill deleted successfully.');
                const pid = (bill as any).patient?.id || (bill as any).patientId;
                router.push(pid ? `/dashboard/billing/patient/${pid}` : '/dashboard/billing');
            });
        }
    }

    const handleDownloadPdf = () => {
        if (bill && patient) {
            const doc = generateInvoicePdf(bill as any, patient);
            doc.save(`invoice-${bill.id}.pdf`);
        }
    }


    if (!bill || !patient) return <div>Loading invoice...</div>;

    const isOwner = currentUser?.role === 'owner';

    if (isEditing) {
        return <EditBillForm bill={bill} onSave={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
                    <p className="text-gray-500">Invoice ID: {bill.id}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-semibold">The Dental Experts</h2>
                    <p className="text-sm">A-123, Dental Avenue, Tooth-City, 110001</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                    <h3 className="font-semibold mb-2">Billed To:</h3>
                    <p>{patient.fullName}</p>
                    <p>{patient.phoneNumber}</p>
                </div>
                <div className="text-right">
                    <p><strong>Date Issued:</strong> {formatDate(bill.issuedAt as any)}</p>
                    <p><strong>Status:</strong> {(bill as any).status}</p>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-left">Service Description</th>
                        <th className="p-2 text-right">Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {(bill.items || []).map((item: any, index: number) => (
                        <tr key={index} className="border-b">
                            <td className="p-2">{item.description}</td>
                            <td className="p-2 text-right">₹{Number(item.cost).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-bold">
                        <td className="p-2 text-right">Total</td>
                        <td className="p-2 text-right">₹{bill.amount.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Status: 
                        <span className={`ml-2 px-2 py-1 rounded-full text-sm ${bill.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {bill.status}
                        </span>
                    </p>
                    {bill.status === 'paid' && bill.processedBy && (
                        <p className="text-sm text-gray-600 mt-1">Paid on {formatDateTime(bill.paymentDetails!.paymentDate)} by {bill.processedBy}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDownloadPdf} className="bg-blue-500 text-white py-2 px-4 rounded">Download PDF</button>
                    {isOwner && (
                        <>
                            <button onClick={() => setIsEditing(true)} className="bg-yellow-500 text-white py-2 px-4 rounded">Edit</button>
                            <button onClick={handleDelete} className="bg-red-500 text-white py-2 px-4 rounded">Delete</button>
                        </>
                    )}
                    {bill.status !== 'paid' && <button onClick={handleMarkAsPaid} className="bg-green-500 text-white py-2 px-4 rounded">Mark as Paid</button>}
                </div>
            </div>
        </div>
    );
}

export default withAuth(InvoicePage, ['owner', 'doctor', 'receptionist']);
