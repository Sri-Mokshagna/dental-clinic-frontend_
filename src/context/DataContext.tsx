'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { Patient, Appointment, Expense, User } from '@/types';
import { ApiService, ApiError } from '@/lib/api';

interface DataContextType {
  // Data
  patients: Patient[];
  appointments: Appointment[];
  expenses: Expense[];
  pendingExpenses: Expense[];
  users: User[];
  
  // Loading states
  loading: {
    patients: boolean;
    appointments: boolean;
    expenses: boolean;
    pendingExpenses: boolean;
    users: boolean;
  };
  
  // Error states
  error: string | null;
  
  // Actions
  refreshPatients: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshPendingExpenses: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  
  // CRUD operations
  createPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (id: number, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: number) => Promise<void>;
  
  createAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: number, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: number) => Promise<void>;
  
  createExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: number, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  approveExpense: (id: number) => Promise<void>;
  rejectExpense: (id: number) => Promise<void>;
  
  createUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: number, user: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    patients: false,
    appointments: false,
    expenses: false,
    pendingExpenses: false,
    users: false,
  });

  // Refresh functions
  const refreshPatients = async () => {
    try {
      setLoading(prev => ({ ...prev, patients: true }));
      setError(null);
      const data = await ApiService.getPatients();
      setPatients(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch patients');
      }
    } finally {
      setLoading(prev => ({ ...prev, patients: false }));
    }
  };

  const refreshAppointments = async () => {
    try {
      setLoading(prev => ({ ...prev, appointments: true }));
      setError(null);
      const data = await ApiService.getAppointments();
      setAppointments(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch appointments');
      }
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }));
    }
  };

  const refreshExpenses = async () => {
    try {
      setLoading(prev => ({ ...prev, expenses: true }));
      setError(null);
      const data = await ApiService.getExpenses();
      setExpenses(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch expenses');
      }
    } finally {
      setLoading(prev => ({ ...prev, expenses: false }));
    }
  };

  const refreshPendingExpenses = async () => {
    try {
      setLoading(prev => ({ ...prev, pendingExpenses: true }));
      setError(null);
      const data = await ApiService.getPendingExpenses();
      setPendingExpenses(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch pending expenses');
      }
    } finally {
      setLoading(prev => ({ ...prev, pendingExpenses: false }));
    }
  };

  const refreshUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      setError(null);
      const data = await ApiService.getUsers();
      setUsers(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch users');
      }
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  // Patient CRUD
  const createPatient = async (patientData: Omit<Patient, 'id'>) => {
    try {
      setError(null);
      await ApiService.createPatient(patientData);
      await refreshPatients();
      toast.success('Patient created');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to create patient');
        toast.error('Failed to create patient');
      }
      throw err;
    }
  };

  const updatePatient = async (id: number, patientData: Partial<Patient>) => {
    try {
      setError(null);
      await ApiService.updatePatient(id.toString(), patientData);
      await refreshPatients();
      toast.success('Patient updated');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to update patient');
        toast.error('Failed to update patient');
      }
      throw err;
    }
  };

  const deletePatient = async (id: number) => {
    try {
      setError(null);
      await ApiService.deletePatient(id.toString());
      await refreshPatients();
      toast.success('Patient deleted');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to delete patient');
        toast.error('Failed to delete patient');
      }
      throw err;
    }
  };

  // Appointment CRUD
  const createAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      setError(null);
      await ApiService.createAppointment(appointmentData);
      await refreshAppointments();
      toast.success('Appointment created');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to create appointment');
        toast.error('Failed to create appointment');
      }
      throw err;
    }
  };

  const updateAppointment = async (id: number, appointmentData: Partial<Appointment>) => {
    try {
      setError(null);
      await ApiService.updateAppointment(id.toString(), appointmentData);
      await refreshAppointments();
      toast.success('Appointment updated');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to update appointment');
        toast.error('Failed to update appointment');
      }
      throw err;
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      setError(null);
      await ApiService.deleteAppointment(id.toString());
      await refreshAppointments();
      toast.success('Appointment deleted');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to delete appointment');
        toast.error('Failed to delete appointment');
      }
      throw err;
    }
  };

  // Expense CRUD
  const createExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      setError(null);
      await ApiService.createExpense(expenseData);
      await refreshExpenses();
      await refreshPendingExpenses(); // Also refresh pending expenses
      toast.success('Expense created');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to create expense');
        toast.error('Failed to create expense');
      }
      throw err;
    }
  };

  const updateExpense = async (id: number, expenseData: Partial<Expense>) => {
    try {
      setError(null);
      await ApiService.updateExpense(id.toString(), expenseData);
      await refreshExpenses();
      toast.success('Expense updated');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to update expense');
        toast.error('Failed to update expense');
      }
      throw err;
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      setError(null);
      await ApiService.deleteExpense(id.toString());
      await refreshExpenses();
      toast.success('Expense deleted');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to delete expense');
        toast.error('Failed to delete expense');
      }
      throw err;
    }
  };

  const approveExpense = async (id: number) => {
    try {
      setError(null);
      await ApiService.approveExpense(id.toString());
      await refreshExpenses();
      await refreshPendingExpenses(); // Also refresh pending expenses
      toast.success('Expense approved');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to approve expense');
        toast.error('Failed to approve expense');
      }
      throw err;
    }
  };

  const rejectExpense = async (id: number) => {
    try {
      setError(null);
      await ApiService.rejectExpense(id.toString());
      await refreshExpenses();
      await refreshPendingExpenses(); // Also refresh pending expenses
      toast.success('Expense rejected');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to reject expense');
        toast.error('Failed to reject expense');
      }
      throw err;
    }
  };

  // User CRUD
  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      setError(null);
      await ApiService.createUser(userData);
      await refreshUsers();
      toast.success('User created');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to create user');
        toast.error('Failed to create user');
      }
      throw err;
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    try {
      setError(null);
      await ApiService.updateUser(id.toString(), userData);
      await refreshUsers();
      toast.success('User updated');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to update user');
        toast.error('Failed to update user');
      }
      throw err;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setError(null);
      await ApiService.deleteUser(id.toString());
      await refreshUsers();
      toast.success('User deleted');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError('Failed to delete user');
        toast.error('Failed to delete user');
      }
      throw err;
    }
  };

  // Load initial data
  useEffect(() => {
    refreshPatients();
    refreshAppointments();
    refreshExpenses();
    refreshPendingExpenses();
    refreshUsers();
  }, []);

  return (
    <DataContext.Provider value={{
      patients,
      appointments,
      expenses,
      pendingExpenses,
      users,
      loading,
      error,
      refreshPatients,
      refreshAppointments,
      refreshExpenses,
      refreshPendingExpenses,
      refreshUsers,
      createPatient,
      updatePatient,
      deletePatient,
      createAppointment,
      updateAppointment,
      deleteAppointment,
      createExpense,
      updateExpense,
      deleteExpense,
      approveExpense,
      rejectExpense,
      createUser,
      updateUser,
      deleteUser,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
