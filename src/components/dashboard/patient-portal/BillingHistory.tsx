'use client';

import { useState, useEffect } from 'react';
import { Bill } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface BillingHistoryProps {
  patientId: string;
}

export default function BillingHistory({ patientId }: BillingHistoryProps) {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const allBills: Bill[] = JSON.parse(localStorage.getItem('bills') || '[]').map((b: Bill) => ({ ...b, issuedAt: new Date(b.issuedAt) }));
    const patientBills = allBills
      .filter(b => b.patientId === patientId)
      .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
    setBills(patientBills);
  }, [patientId]);

  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-bold mb-2">Billing History</h3>
      {bills.length > 0 ? (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="p-2 border-b">Date</th>
              <th className="p-2 border-b">Amount</th>
              <th className="p-2 border-b">Status</th>
              <th className="p-2 border-b"></th>
            </tr>
          </thead>
          <tbody>
            {bills.map(bill => (
              <tr key={bill.id}>
                <td className="p-2 border-b">{formatDate(bill.issuedAt)}</td>
                <td className="p-2 border-b">₹{bill.amount.toFixed(2)}</td>
                <td className="p-2 border-b">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    bill.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bill.status}
                  </span>
                </td>
                <td className="p-2 border-b text-right">
                  <Link href={`/dashboard/billing/${bill.id}`} className="text-blue-500 hover:underline text-sm">
                    View Invoice
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">You have no billing history.</p>
      )}
    </div>
  );
}
