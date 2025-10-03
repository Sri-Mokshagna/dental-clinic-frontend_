'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { ApiService, ApiError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  register: (userData: {
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in (from localStorage). Prefer existing key used by withAuth/session.
    const savedCurrent = localStorage.getItem('currentUser');
    const savedUser = localStorage.getItem('user');
    const raw = savedCurrent || savedUser;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const normalizedRole = (parsed?.role || '').toString().toLowerCase();
        const appRole = normalizedRole === 'admin' ? 'owner' : normalizedRole;
        const normalizedUser = { ...parsed, role: appRole };
        setUser(normalizedUser);
        localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.login(username, password);
      const backendUser = response.user as User;
      const normalizedRole = (backendUser?.role as any || '').toString().toLowerCase();
      const appRole = normalizedRole === 'admin' ? 'owner' : normalizedRole;
      const userData = { ...backendUser, role: appRole } as User;
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    password: string;
    email: string;
    phoneNumber: string;
    fullName: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.register(userData);
      const backendUser = response.user as User;
      const normalizedRole = (backendUser?.role as any || '').toString().toLowerCase();
      const appRole = normalizedRole === 'admin' ? 'owner' : normalizedRole;
      const newUser = { ...backendUser, role: appRole } as User;
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    // Don't clear clinicLogo - preserve it across sessions
    // localStorage.clear(); // Removed this line
    // Force redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
