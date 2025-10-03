'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientPortal() {
  const router = useRouter();

  useEffect(() => {
    // Check if patient is already logged in
    const storedPatient = localStorage.getItem('patientData');
    if (storedPatient) {
      router.push('/patient-portal/dashboard');
    } else {
      router.push('/patient-portal/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to patient portal...</p>
      </div>
    </div>
  );
}
