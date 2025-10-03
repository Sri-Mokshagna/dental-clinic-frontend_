'use client';

import withAuth from '@/components/auth/withAuth';
// Removed OverdueAppointments per request
// Removed PendingBilling per request
import Link from 'next/link';
import TodayAppointments from '@/components/dashboard/TodayAppointments';

function StaffDashboard() {
    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Staff Dashboard</h1>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Register Patient</Link>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <h2 className="text-xl font-semibold mb-3">Today's Appointments</h2>
                    <TodayAppointments />
                </div>
                {/* Pending Billing removed */}
                {/* More staff-specific widgets can be added here in the future */}
            </div>
        </div>
    );
}

export default withAuth(StaffDashboard, ['staff']);
