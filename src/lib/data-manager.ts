import {
  User,
  Patient,
  Appointment,
  Prescription,
  Bill,
  TreatmentPlan,
  Expense,
  ClinicSettings,
  Doctor,
  ClinicProfile,
} from '../types';
import { 
    users as initialUsers, 
    patients as initialPatients, 
    doctors as initialDoctors, 
    staff as initialStaff, 
    appointments as initialAppointments,
    bills as initialBills,
    treatmentPlans as initialTreatmentPlans,
    expenses as initialExpenses,
    prescriptions as initialPrescriptions
} from '../data/mock';

const isBrowser = typeof window !== 'undefined';

function getFromStorage<T>(key: string, defaultValue: T[] = []): T[] {
  if (!isBrowser) {
    return defaultValue;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
}


function initializeData<T>(key: string, initialData: T[]): T[] {
  if (!isBrowser) return initialData;

  const storedData = localStorage.getItem(key);
  if (storedData) {
    // Dates are stored as strings in JSON, so we need to parse them back
    const parsedData = JSON.parse(storedData, (k, v) => {
        if (k.endsWith('At') || k.endsWith('Date') || k.startsWith('start') || k.startsWith('end')) {
            return v ? new Date(v) : v;
        }
        return v;
    });

    // Data correction for 'clinic-admin'
    if (key === 'bills' || key === 'expenses') {
      const correctedData = parsedData.map((item: any) => {
        if (item.createdBy === 'clinic-admin') {
          return { ...item, createdBy: 'owner' };
        }
        return item;
      });
      // Save the corrected data back to localStorage
      localStorage.setItem(key, JSON.stringify(correctedData));
      return correctedData;
    }

    return parsedData;
  }
  
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
}

export const users: User[] = initializeData('users', initialUsers);
export const patients: Patient[] = initializeData('patients', initialPatients);
export const doctors: Doctor[] = initializeData('doctors', initialDoctors);
export const staff: Staff[] = initializeData('staff', initialStaff);
export const appointments: Appointment[] = initializeData('appointments', initialAppointments);
export const bills: Bill[] = initializeData('bills', initialBills);
export const treatmentPlans: TreatmentPlan[] = initializeData('treatmentPlans', initialTreatmentPlans);
export const expenses: Expense[] = initializeData('expenses', initialExpenses);
export const prescriptions: Prescription[] = initializeData('prescriptions', initialPrescriptions);

// Clinic Settings
export interface ClinicSettings {
  defaultConsultationFee: number;
  appointmentSettings: {
    startTime: string;
    endTime: string;
    slotDuration: number;
  };
}

export function getClinicSettings(): ClinicSettings {
  const defaultSettings = {
    defaultConsultationFee: 1500,
    appointmentSettings: {
      startTime: '10:00',
      endTime: '20:00',
      slotDuration: 30,
    },
  };
  const settings = getFromStorage<ClinicSettings>('clinicSettings', [defaultSettings]);
  const mergedSettings = {
    ...defaultSettings,
    ...settings[0],
    appointmentSettings: {
      ...defaultSettings.appointmentSettings,
      ...(settings[0]?.appointmentSettings || {}),
    },
  };
  return mergedSettings; // Assuming a single settings object
}

export function updateClinicSettings(newSettings: ClinicSettings) {
  saveData<ClinicSettings>('clinicSettings', [newSettings]);
}

const initialClinicProfile: ClinicProfile = {
  name: "The Dental Experts",
  address: "#201, 2nd floor, Aparna Green Apts, Above ICICI Bank, Nanakramguda Hyderabad",
  contact: "Ph : 8125439878",
};

export function getClinicProfile(): ClinicProfile {
  const profile = getFromStorage<ClinicProfile>('clinicProfile', [initialClinicProfile]);
  return profile[0];
}

export function updateClinicProfile(newProfile: ClinicProfile) {
  saveData<ClinicProfile>('clinicProfile', [newProfile]);
}

export function addDoctor(doctor: Doctor) {
  doctors.push(doctor);
  saveData('doctors', doctors);
}

export function deleteDoctor(doctorId: string) {
  const index = doctors.findIndex(d => d.id === doctorId);
  if (index !== -1) {
    doctors.splice(index, 1);
    saveData('doctors', doctors);
  }
}

function saveData<T>(key: string, data: T[]) {
    if (isBrowser) {
        localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(new Event('storage')); // Notify other tabs/windows
    }
}

export function addUser(user: User) {
    users.push(user);
    saveData('users', users);
}

export function addPatient(patient: Patient) {
    patients.push(patient);
    saveData('patients', patients);
}

export function addAppointment(appointment: Appointment) {
    appointments.push(appointment);
    saveData('appointments', appointments);
}

export function addBill(bill: Bill) {
    bills.push(bill);
    saveData('bills', bills);

    // If the bill is linked to an appointment, update the appointment's billing status
    if (bill.appointmentId) {
        const appointment = appointments.find(a => a.id === bill.appointmentId);
        if (appointment) {
            appointment.billingStatus = 'billed';
            updateAppointment(appointment);
        }
    }
}

export function addTreatmentPlan(plan: TreatmentPlan) {
    treatmentPlans.push(plan);
    saveData('treatmentPlans', treatmentPlans);
}

export function addExpense(expense: Expense) {
    expenses.push(expense);
    saveData('expenses', expenses);
}

export function deleteExpense(expenseId: string) {
    const index = expenses.findIndex(exp => exp.id === expenseId);
    if (index !== -1) {
        expenses.splice(index, 1);
        saveData('expenses', expenses);
    }
}

export function updateExpense(updatedExpense: Expense) {
    const index = expenses.findIndex(exp => exp.id === updatedExpense.id);
    if (index !== -1) {
        expenses[index] = updatedExpense;
        saveData('expenses', expenses);
    }
}

export function addPrescription(prescription: Prescription) {
    prescriptions.push(prescription);
    saveData('prescriptions', prescriptions);
}

export function updatePrescription(updatedPrescription: Prescription) {
    const index = prescriptions.findIndex(p => p.id === updatedPrescription.id);
    if (index !== -1) {
        prescriptions[index] = updatedPrescription;
        saveData('prescriptions', prescriptions);
    }
}

export function deletePrescription(id: string) {
    const index = prescriptions.findIndex(p => p.id === id);
    if (index !== -1) {
        prescriptions.splice(index, 1);
        saveData('prescriptions', prescriptions);
    }
}

export const deletePatients = (patientIds: string[]) => {
    const patientIdSet = new Set(patientIds);

    const updatedPatients = patients.filter(p => !patientIdSet.has(p.id));
    const updatedAppointments = appointments.filter(a => !patientIdSet.has(a.patientId));
    const updatedBills = bills.filter(b => !patientIdSet.has(b.patientId));
    const updatedTreatmentPlans = treatmentPlans.filter(tp => !patientIdSet.has(tp.patientId));
    const updatedPrescriptions = prescriptions.filter(p => !patientIdSet.has(p.patientId));
    
    saveData('patients', updatedPatients);
    saveData('appointments', updatedAppointments);
    saveData('bills', updatedBills);
    saveData('treatmentPlans', updatedTreatmentPlans);
    saveData('prescriptions', updatedPrescriptions);
};


export function updatePatient(updatedPatient: Patient) {
    const index = patients.findIndex(p => p.id === updatedPatient.id);
    if (index !== -1) {
        patients[index] = updatedPatient;
        saveData('patients', patients);
    }
}

export function updateAppointment(updatedAppointment: Appointment) {
    if (updatedAppointment.status === 'completed' && !updatedAppointment.billingStatus) {
        updatedAppointment.billingStatus = 'unbilled';
    }
    const index = appointments.findIndex(a => a.id === updatedAppointment.id);
    if (index !== -1) {
        appointments[index] = updatedAppointment;
        saveData('appointments', appointments);
    }
}

export function deleteAppointment(appointmentId: string) {
  const index = appointments.findIndex(app => app.id === appointmentId);
  if (index !== -1) {
    appointments.splice(index, 1);
    saveData('appointments', appointments);
  }
}

export function updateBill(updatedBill: Bill) {
    const index = bills.findIndex(b => b.id === updatedBill.id);
    if (index !== -1) {
        bills[index] = updatedBill;
        saveData('bills', bills);
    }
}

export function updateTreatmentPlan(updatedPlan: TreatmentPlan) {
    const index = treatmentPlans.findIndex(p => p.id === updatedPlan.id);
    if (index !== -1) {
        treatmentPlans[index] = updatedPlan;
        saveData('treatmentPlans', treatmentPlans);
    }
}

// Getter functions
export function getAppointments(): Appointment[] {
    return appointments;
}

export function getAllPatients(): Patient[] {
    return patients;
}

export function getAllBills(): Bill[] {
    return bills;
}

export const deleteBill = (billId: string) => {
  let allBills = getAllBills();
  const updatedBills = allBills.filter(bill => bill.id !== billId);
  saveData('bills', updatedBills);
};
