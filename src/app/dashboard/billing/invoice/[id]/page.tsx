'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import withAuth from '@/components/auth/withAuth';
import { Bill, Patient } from '@/types';
import { ApiService } from '@/lib/api';
import PrintableReceipt from '@/components/common/PrintableReceipt';

function InvoicePage() {
  const params = useParams();
  const billId = params.id as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!billId) return;
    setLoading(true);
    ApiService.getBill(String(billId))
      .then((b) => {
        setBill(b);
        if ((b as any).patientId) {
          return ApiService.getPatient(String((b as any).patientId)).then(setPatient);
        }
      })
      .finally(() => setLoading(false));
  }, [billId]);

  if (loading) {
    return <div className="p-6 text-center">Loading Receipt...</div>;
  }

  if (!bill || !patient) {
    return <div className="p-6 text-center">Receipt or Patient not found.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <PrintableReceipt bill={bill} patient={patient} />
    </div>
  );
}

export default withAuth(InvoicePage, ['owner', 'doctor', 'receptionist', 'staff']);
