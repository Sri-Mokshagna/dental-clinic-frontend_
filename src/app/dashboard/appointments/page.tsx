'use client';

import AppointmentList from '@/components/appointments/AppointmentList';
import withAuth from '@/components/auth/withAuth';

function AppointmentsPage() {
  return (
    <div>
      <AppointmentList />
    </div>
  );
}

export default withAuth(AppointmentsPage, ['owner', 'doctor', 'receptionist', 'staff']);
