'use client';
import React from 'react';
import { Bill, Patient } from '@/types';
import PrintableLayout from './PrintableLayout';
import { formatDate } from '@/lib/utils';

interface PrintableReceiptProps {
  bill: Bill;
  patient: Patient;
}

function PrintableReceipt({ bill, patient }: PrintableReceiptProps) {
  if (!bill || !patient) {
    return <div>Loading receipt...</div>;
  }

  return (
    <PrintableLayout title="Receipt">
      {/* Bill To and Dates */}
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Bill To:</h3>
          <p>{(patient as any).fullName || (patient as any).name}</p>
          <p>{(patient as any).address || (patient as any).contact?.address || '-'}</p>
          <p>{(patient as any).phoneNumber || (patient as any).contact?.phone || '-'}</p>
        </div>
        <div className="text-right">
          <p><span className="font-semibold">Receipt Number:</span> {bill.id}</p>
          <p><span className="font-semibold">Issued Date:</span> {formatDate(bill.issuedAt as any)}</p>
          {(bill as any).paymentDate && (
            <p><span className="font-semibold">Payment Date:</span> {formatDate((bill as any).paymentDate as any)}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-3 text-left font-semibold">Service / Item Description</th>
            <th className="p-3 text-right font-semibold">Cost</th>
          </tr>
        </thead>
        <tbody>
          {(bill.items || []).map((item: any, index: number) => (
            <tr key={index} className="border-b">
              <td className="p-3">{item.description}</td>
              <td className="p-3 text-right">₹{(item.cost || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total and Status */}
      <div className="flex justify-end items-center">
        <div className="text-right w-full max-w-xs">
          <div className="flex justify-between mb-1">
            <span className="font-semibold">Subtotal:</span>
            <span>₹{bill.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Discount:</span>
            <span>₹0.00</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold">Status:</span>
            <span className="uppercase">{(bill.status || '').toString()}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-semibold">Payment Method:</span>
            <span>{(bill as any).paymentMethod || '-'}</span>
          </div>
          <div className="flex justify-between font-bold text-xl border-t-2 border-gray-800 pt-2">
            <span className="font-bold text-xl">Amount Paid:</span>
            <span className="font-bold text-xl">₹{(((bill.status || '').toString().toUpperCase() === 'PAID') ? bill.amount : 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </PrintableLayout>
  );
}

export default PrintableReceipt;
