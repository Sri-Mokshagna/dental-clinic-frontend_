'use client';

import { useEffect, useState } from 'react';
import { ApiService } from '@/lib/api';
import { UsersIcon, CalendarIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { isToday } from 'date-fns';
import { getCurrentUser } from '@/lib/session';
import { User } from '@/types';

const DashboardMetrics = () => {
  const [patientCount, setPatientCount] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    ApiService.getAppointments().then(apps => {
      const todayAppointments = (apps as any[]).filter(app => isToday(new Date(app.appointmentDate)));
      setTodaysAppointments(todayAppointments.length);
    });
    if (getCurrentUser()?.role !== 'doctor' && getCurrentUser()?.role !== 'DOCTOR') {
      ApiService.getPatients().then(pats => setPatientCount((pats as any[]).length));
      ApiService.getBills().then(bills => {
        const revenue = (bills as any[]).reduce((acc, bill) => acc + (bill.amount || 0), 0);
        setTotalRevenue(revenue);
      });
    }
  }, []);

  let metrics = [];

  if (user?.role === 'doctor' || user?.role === 'DOCTOR') {
    metrics = [
        { name: 'Today\'s Appointments', value: todaysAppointments, icon: CalendarIcon },
    ];
  } else if (user?.role === 'owner' || user?.role === 'ADMIN') {
    metrics = [
        { name: 'Total Patients', value: patientCount, icon: UsersIcon },
        { name: 'Today\'s Appointments', value: todaysAppointments, icon: CalendarIcon },
    ];
  } else {
    metrics = [
        { name: 'Total Patients', value: patientCount, icon: UsersIcon },
        { name: 'Today\'s Appointments', value: todaysAppointments, icon: CalendarIcon },
        { name: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: BanknotesIcon },
    ];
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <div key={metric.name} className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <metric.icon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">{metric.name}</h2>
            <p className="text-3xl font-semibold text-gray-800">{metric.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;

