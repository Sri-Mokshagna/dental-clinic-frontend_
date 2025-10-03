'use client';

import PatientList from '@/components/patients/PatientList';
import withAuth from '@/components/auth/withAuth';

function PatientsPage() {
  return (
    <div>
      <PatientList />
    </div>
  );
}

export default withAuth(PatientsPage, ['owner', 'doctor', 'staff', 'receptionist', 'admin']);
