import React from 'react';
import { getClinicProfile } from '@/lib/data-manager';

interface PrintableLayoutProps {
  title: string;
  children: React.ReactNode;
}

function PrintableLayout({ title, children }: PrintableLayoutProps) {
  const clinicProfile = getClinicProfile();

  return (
    <div id="printable-content" className="bg-white text-gray-800 p-8 shadow-lg rounded-lg max-w-4xl mx-auto my-4 font-sans border border-gray-200">
      <header className="flex justify-between items-center pb-6 border-b-2 border-gray-800">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{clinicProfile.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{clinicProfile.address}</p>
          <p className="text-sm text-gray-600">{clinicProfile.contact}</p>
        </div>
        <h2 className="text-3xl font-semibold text-gray-700 uppercase">{title}</h2>
      </header>
      <main className="mt-8">
        {children}
      </main>
      <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-xs">
        <p>Thank you for choosing {clinicProfile.name}.</p>
        <p>For any queries regarding this receipt, please contact us.</p>
      </footer>
    </div>
  );
}

export default PrintableLayout;
