'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ClinicProfile, getClinicProfile, updateClinicProfile } from '@/lib/data-manager';

interface ClinicContextType {
  clinicProfile: ClinicProfile | null;
  updateProfile: (newProfile: ClinicProfile) => void;
  loading: boolean;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicContextProvider = ({ children }: { children: ReactNode }) => {
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getClinicProfile();
    setClinicProfile(profile);
    setLoading(false);
  }, []);

  const updateProfile = (newProfile: ClinicProfile) => {
    updateClinicProfile(newProfile);
    setClinicProfile(newProfile);
  };

  return (
    <ClinicContext.Provider value={{ clinicProfile, updateProfile, loading }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinic must be used within a ClinicContextProvider');
  }
  return context;
};



