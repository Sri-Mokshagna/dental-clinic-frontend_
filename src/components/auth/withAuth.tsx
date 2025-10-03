'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { User } from '@/types';

function normalizeRole(role: string | undefined): 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT' | undefined {
  if (!role) return undefined;
  const r = role.toString().toLowerCase();
  if (r === 'admin' || r === 'owner' || r === 'clinic-admin') return 'ADMIN';
  if (r === 'doctor') return 'DOCTOR';
  if (r === 'staff' || r === 'receptionist') return 'STAFF';
  if (r === 'patient' || r === 'patient-register') return 'PATIENT';
  return role.toString().toUpperCase() as any;
}

export default function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: Array<string>
) {
  return function WithAuth(props: P) {
    const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      // Delay check until client-side hydration completes to avoid transient redirects
      const timer = setTimeout(() => {
        const user = getCurrentUser();
        if (!user) {
          // Clear any stale data and redirect to login
          localStorage.clear();
          router.replace('/login');
          return;
        } else {
          const loginTime = localStorage.getItem('loginTime');
      const now = Date.now();
      const FIVE_HOURS = 5 * 60 * 60 * 1000;

      if (!loginTime) {
        localStorage.setItem('loginTime', String(now));
      } else if (now - parseInt(loginTime) > FIVE_HOURS) {
        // Session expired
        localStorage.clear();
        router.replace('/login?timeout');
        return;
      }
          const userRole = normalizeRole((user as any).role);
          const allowedNormalized = allowedRoles.map(r => normalizeRole(r)!).filter(Boolean);
          if (!userRole || !allowedNormalized.includes(userRole)) {
            router.replace('/dashboard');
            return;
          }
          setCurrentUser({ ...user, role: userRole } as User);
          setLoading(false);
        }
      }, 0);
      return () => clearTimeout(timer);
    }, [router]);

    // Listen for storage changes (logout from another tab)
    useEffect(() => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'currentUser' && !e.newValue) {
          router.replace('/login');
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, [router]);

    if (loading) {
      return <div>Loading...</div>; // Or a spinner component
    }

    if (!currentUser) {
        return null; // Should be redirected
    }

    return <Component {...props} />;
  };
}
