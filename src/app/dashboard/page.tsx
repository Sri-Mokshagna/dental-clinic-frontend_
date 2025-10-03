'use client';

import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UpcomingAppointments from '@/components/dashboard/patient-portal/UpcomingAppointments';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import BillingHistory from '@/components/dashboard/patient-portal/BillingHistory';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
// Removed OverdueAppointments per request
// Removed PendingBilling per request
import AdminActions from '@/components/admin/AdminActions';
import PendingExpenses from '@/components/dashboard/PendingExpenses';
import { PageLoader } from '@/components/common/LoadingSpinner';
import { 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const { createPatient, refreshPatients } = useData();
  const router = useRouter();

  // Inline Add Patient state
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    phoneNumber: '',
    age: '',
    gender: 'male',
    address: '',
    email: '',
    medicalInfo: '',
  });
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const submitAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError(null);
    try {
      setSavingPatient(true);
      const payload: any = {
        fullName: newPatient.fullName,
        age: newPatient.age ? parseInt(newPatient.age, 10) : 0,
        gender: newPatient.gender,
        phoneNumber: newPatient.phoneNumber, // no +91 forced prefix
        address: newPatient.address,
        email: newPatient.email,
        medicalInfo: newPatient.medicalInfo,
      };
      await createPatient(payload);
      await refreshPatients();
      setNewPatient({ fullName: '', phoneNumber: '', age: '', gender: 'male', address: '', email: '', medicalInfo: '' });
      setShowAddPatient(false);
      alert('Patient added successfully');
    } catch (err: any) {
      setPatientError(err?.message || 'Failed to add patient');
    } finally {
      setSavingPatient(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <PageLoader />;
  }

  // Patient-specific dashboard
  if (user.role === 'PATIENT') {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.fullName}!</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingAppointments patientId={user.id.toString()} />
          <BillingHistory patientId={user.id.toString()} />
        </div>
      </div>
    );
  }

  // Staff/Doctor/Admin dashboard
  return (
    <div className="min-h-screen bg-dental-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dental-foreground flex items-center">
                <HomeIcon className="w-8 h-8 text-primary-600 mr-3" />
                Welcome back, {user.fullName}!
              </h1>
              <p className="text-dental-muted mt-2">
                Here's what's happening at your dental clinic today
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-dental-muted">Logged in as</p>
                <p className="font-semibold text-dental-foreground capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
      
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="dental-card p-6 card-hover animate-fade-in">
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-xl">
                <UsersIcon className="w-6 h-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">Patients</p>
                <p className="text-2xl font-bold text-dental-foreground">Manage</p>
              </div>
            </div>
          </div>

          <div className="dental-card p-6 card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">Appointments</p>
                <p className="text-2xl font-bold text-dental-foreground">Schedule</p>
              </div>
            </div>
          </div>

          <div className="dental-card p-6 card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-xl">
                <ClipboardDocumentListIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">Prescriptions</p>
                <p className="text-2xl font-bold text-dental-foreground">Create</p>
              </div>
            </div>
          </div>

          <div className="dental-card p-6 card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CreditCardIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-dental-muted">Billing</p>
                <p className="text-2xl font-bold text-dental-foreground">Process</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inline Add Patient */}
        <div className="dental-card p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-dental-foreground flex items-center">
              <SparklesIcon className="w-6 h-6 text-primary-600 mr-2" />
              Quick Patient Registration
            </h2>
            <button
              onClick={() => setShowAddPatient(s => !s)}
              className="dental-button btn-animate"
            >
              {showAddPatient ? 'Cancel' : 'Add New Patient'}
            </button>
          </div>
          {showAddPatient && (
            <form onSubmit={submitAddPatient} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientError && (
                <div className="md:col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{patientError}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-dental-foreground mb-1">Full Name</label>
                <input 
                  placeholder="Enter patient's full name" 
                  className="dental-input w-full" 
                  value={newPatient.fullName} 
                  onChange={e => setNewPatient({ ...newPatient, fullName: e.target.value })} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dental-foreground mb-1">Phone Number</label>
                <input 
                  placeholder="Enter phone number" 
                  className="dental-input w-full" 
                  value={newPatient.phoneNumber} 
                  onChange={e => setNewPatient({ ...newPatient, phoneNumber: e.target.value })} 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dental-foreground mb-1">Email</label>
                <input 
                  placeholder="Enter email address" 
                  type="email" 
                  className="dental-input w-full" 
                  value={newPatient.email} 
                  onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dental-foreground mb-1">Age</label>
                <input 
                  placeholder="Enter age" 
                  type="number" 
                  className="dental-input w-full" 
                  value={newPatient.age} 
                  onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dental-foreground mb-1">Gender</label>
                <select 
                  className="dental-input w-full" 
                  value={newPatient.gender} 
                  onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dental-foreground mb-1">Address</label>
                <input 
                  placeholder="Enter address" 
                  className="dental-input w-full" 
                  value={newPatient.address} 
                  onChange={e => setNewPatient({ ...newPatient, address: e.target.value })} 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dental-foreground mb-1">Medical Information</label>
                <textarea 
                  placeholder="Enter any medical history or notes" 
                  className="dental-input w-full h-24 resize-none" 
                  value={newPatient.medicalInfo} 
                  onChange={e => setNewPatient({ ...newPatient, medicalInfo: e.target.value })} 
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddPatient(false)} 
                  className="px-6 py-2 text-dental-muted border border-dental-border rounded-lg hover:bg-dental-surface-dark transition-colors duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingPatient} 
                  className="dental-button btn-animate disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPatient ? (
                    <div className="flex items-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Patient'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Dashboard Metrics */}
        <div className="mb-8">
          <DashboardMetrics />
        </div>

        {/* Admin Actions */}
        {(user.role === 'ADMIN' || user.role === 'owner') && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-dental-foreground mb-6 flex items-center">
              <ChartBarIcon className="w-6 h-6 text-primary-600 mr-2" />
              Admin Actions
            </h2>
            <AdminActions />
          </div>
        )}

        {/* Pending Expenses for Admin */}
        {(user.role === 'ADMIN' || user.role === 'owner') && (
          <div className="mb-8">
            <PendingExpenses />
          </div>
        )}

        {/* Today's Appointments (replacing overdue + all) */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-dental-foreground mb-6 flex items-center">
            <CalendarIcon className="w-6 h-6 text-secondary-600 mr-2" />
            Today's Appointments
          </h2>
          <TodayAppointments />
        </div>
        
        {/* Pending Billing removed */}
      </div>
    </div>
  );
}
