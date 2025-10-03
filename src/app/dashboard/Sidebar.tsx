'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3Icon,
  UsersIcon,
  CalendarIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { getCurrentUser } from '@/lib/session';
import { useClinic } from '@/context/ClinicContext';
import { useIsClient } from '@/hooks/useIsClient';
import { useLogo } from '@/context/LogoContext';

const navigation = [
  { name: 'Register Patient', href: '/register', icon: UsersIcon, roles: ['owner', 'doctor', 'staff'], color: 'text-accent-600' },
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['owner', 'doctor'], color: 'text-primary-600' },
  { name: 'Staff Dashboard', href: '/dashboard/staff', icon: HomeIcon, roles: ['staff'], color: 'text-primary-600' },
  { name: 'Patients', href: '/dashboard/patients', icon: UsersIcon, roles: ['owner', 'doctor', 'staff'], color: 'text-accent-600' },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon, roles: ['owner', 'doctor', 'staff'], color: 'text-secondary-600' },
  { name: 'Medical Notes', href: '/dashboard/medical-notes', icon: ClipboardDocumentListIcon, roles: ['owner', 'doctor'], color: 'text-primary-600' },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCardIcon, roles: ['owner', 'doctor', 'staff'], color: 'text-green-600' },
  { name: 'Expenses', href: '/dashboard/expenses', icon: BanknotesIcon, roles: ['owner', 'doctor', 'staff'], color: 'text-red-600' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartPieIcon, roles: ['owner'], color: 'text-purple-600' },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, roles: ['owner'], color: 'text-gray-600' },
];

// Special navigation for patient-register role
const patientRegisterNavigation = [
  { name: 'Patient Registration', href: '/register', icon: UsersIcon },
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = getCurrentUser();
  const { clinicProfile, loading } = useClinic();
  const { logoUrl } = useLogo();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);
  const isClient = useIsClient();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('user');
      sessionStorage.clear();
      // Prevent back navigation to protected pages
      window.history.pushState(null, '', '/login');
      window.location.href = '/login';
    }
  };

  const userNavigation = navigation.filter(item => item.roles.includes(user?.role || ''));
  
  // Special handling for patient-register role
  let displayNavigation;
  if (user?.role === 'patient-register') {
    displayNavigation = patientRegisterNavigation;
  } else if (userNavigation.length > 0 && user?.role) {
    displayNavigation = userNavigation;
  } else {
    // Fallback navigation if role filtering fails or user is not loaded yet
    displayNavigation = [
      { name: 'Staff Dashboard', href: '/dashboard/staff', icon: HomeIcon },
      { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon },
      { name: 'Billing', href: '/dashboard/billing', icon: CreditCardIcon },
      { name: 'Expenses', href: '/dashboard/expenses', icon: BanknotesIcon },
    ];
  }
  
  // Debug logging to see what's happening
  console.log('Sidebar render - Current user:', user);
  console.log('Sidebar render - User role:', user?.role);
  console.log('Sidebar render - Display navigation count:', displayNavigation.length);
  


  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration mismatch
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden p-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 btn-animate"
        >
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Static sidebar for desktop */}
      <div className={`hidden lg:flex lg:flex-shrink-0 sidebar-transition ${isAnimating ? 'animate-slide-in' : ''}`}>
        <div className="flex flex-col w-64">
          {/* Header with gradient background */}
          <div className="flex items-center h-20 flex-shrink-0 px-6 gradient-primary text-white">
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <img
                    src={logoUrl}
                    alt="Clinic Logo"
                    className="w-8 h-8 object-contain"
                    onError={() => {}}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold">
                  {loading ? 'Loading...' : clinicProfile?.name || 'Dental Clinic'}
                </h1>
                <p className="text-sm text-white/80">Management System</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-dental-surface border-r border-dental-border">
            <nav className="px-4 py-6">
              <div className="space-y-2">
                {displayNavigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500 shadow-dental'
                        : 'text-dental-muted hover:bg-dental-surface-dark hover:text-primary-600',
                      'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 card-hover'
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <item.icon className={`mr-4 flex-shrink-0 h-5 w-5 ${pathname === item.href ? 'text-primary-600' : item.color || 'text-dental-muted group-hover:text-primary-600'}`} />
                    <span className="truncate">{item.name}</span>
                    {pathname === item.href && (
                      <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </div>
            </nav>
            
            {/* User info and logout */}
            <div className="mt-auto p-4 border-t border-dental-border">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-dental-surface-dark rounded-xl">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dental-foreground truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-dental-muted capitalize">
                    {user?.role || 'Role'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl w-full text-dental-muted hover:bg-red-50 hover:text-red-600 transition-all duration-200 btn-animate"
              >
                <ArrowRightOnRectangleIcon className="mr-4 h-5 w-5 text-dental-muted group-hover:text-red-600" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 text-white font-bold text-xl">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Clinic Logo"
                    className="w-8 h-8 object-contain rounded"
                    onError={() => {}}
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <span className="ml-2">
                  {loading ? 'Loading...' : clinicProfile?.name || 'Dental Clinic'}
                </span>
              </div>
              <nav className="mt-5 px-2 space-y-2">
                {displayNavigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={classNames(
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                        : 'text-dental-muted hover:bg-dental-surface-dark hover:text-primary-600',
                      'group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200'
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <item.icon className={`mr-4 flex-shrink-0 h-5 w-5 ${pathname === item.href ? 'text-primary-600' : item.color || 'text-dental-muted group-hover:text-primary-600'}`} />
                    <span className="truncate">{item.name}</span>
                    {pathname === item.href && (
                      <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 p-4">
                <button
                    onClick={handleLogout}
                    className="group flex items-center px-4 py-3 text-base font-medium rounded-xl w-full text-dental-muted hover:bg-red-50 hover:text-red-600 transition-all duration-200 btn-animate"
                >
                    <ArrowRightOnRectangleIcon className="mr-4 h-5 w-5 text-dental-muted group-hover:text-red-600" />
                    Logout
                </button>
            </div>
          </div>
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}
    </>
  );
}
