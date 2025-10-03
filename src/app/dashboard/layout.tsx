'use client';
import React from 'react';
import Sidebar from '@/app/dashboard/Sidebar';
import { ClinicContextProvider } from '@/context/ClinicContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClinicContextProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </ClinicContextProvider>
  );
}
