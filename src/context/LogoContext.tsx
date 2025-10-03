'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LogoContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  updateLogo: (url: string) => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export const LogoProvider = ({ children }: { children: ReactNode }) => {
  const [logoUrl, setLogoUrl] = useState('');

  // Load logo from backend on mount
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/logo/url');
        if (response.ok) {
          const data = await response.json();
          if (data.hasLogo && data.logoUrl) {
            const absoluteUrl = data.logoUrl.startsWith('http') ? data.logoUrl : `http://localhost:8080${data.logoUrl}`;
            setLogoUrl(absoluteUrl);
            // Also save to localStorage for offline access
            if (typeof window !== 'undefined') {
              localStorage.setItem('clinicLogo', absoluteUrl);
            }
          } else {
            // If no logo from backend, check localStorage
            if (typeof window !== 'undefined') {
              const savedLogo = localStorage.getItem('clinicLogo');
              if (savedLogo) {
                setLogoUrl(savedLogo);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load logo from backend:', error);
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const savedLogo = localStorage.getItem('clinicLogo');
          if (savedLogo) {
            setLogoUrl(savedLogo);
          }
        }
      }
    };
    
    loadLogo();
  }, []);

  const updateLogo = (url: string) => {
    // Clean up previous blob URL if it exists
    if (logoUrl && logoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(logoUrl);
    }
    
    const absoluteUrl = url && !url.startsWith('http') ? `http://localhost:8080${url}` : url;
    setLogoUrl(absoluteUrl);
    if (typeof window !== 'undefined') {
      if (absoluteUrl) {
        localStorage.setItem('clinicLogo', absoluteUrl);
      } else {
        localStorage.removeItem('clinicLogo');
      }
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (logoUrl && logoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl, updateLogo }}>
      {children}
    </LogoContext.Provider>
  );
};

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
};
