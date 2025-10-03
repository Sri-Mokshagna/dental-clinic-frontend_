'use client';

import FinancialDashboard from '@/components/analytics/FinancialDashboard';
import withAuth from '@/components/auth/withAuth';

function AnalyticsPage() {
  return (
    <div>
      <FinancialDashboard />
    </div>
  );
}

export default withAuth(AnalyticsPage, ['owner', 'admin', 'doctor', 'staff']);
