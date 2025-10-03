export type UserRole = "ADMIN" | "DOCTOR" | "STAFF" | "PATIENT";

export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  enabled: boolean;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  name: string; // e.g., "Root Canal Therapy", "Annual Check-up"
  costEstimate: number;
  status: 'active' | 'completed';
  createdAt: Date;
}

export interface Patient {
  id: number;
  fullName: string;
  age: number;
  gender: string;
  phoneNumber: string;
  address: string;
  email: string;
  medicalInfo?: string;
  treatmentAmount: number;
  user?: User;
  doctor?: User;
}

export interface Expense {
    id: number;
    description: string;
    amount: number;
    date: string; // ISO date string
    approved: boolean;
    addedBy?: User;
    addedById?: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  notes?: string;
}

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  contact: { phone: string; email: string };
  availability: string[]; // e.g., ["Monday: 9am-5pm"]
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicProfile {
  name: string;
  address: string;
  contact: string;
}

export interface MedicalNote {
  id: string;
  date: Date;
  complaints: string;
  onExamination?: string;
  treatment?: string;
  prescriptionTotal?: number;
  doctorId: string;
}

export interface Appointment {
  id: number;
  appointmentDate: string; // ISO datetime string
  treatmentDetails: string;
  treatmentCost: number;
  patient: Patient;
  doctor?: User;
  staff?: User;
}

export interface Bill {
  id: string;
  patientId: string;
  appointmentId?: string;
  treatmentPlanId?: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  issuedAt: Date;
  items: { description: string; cost: number }[];
  paymentDetails?: {
    paymentDate: Date;
    paymentMethod: 'cash' | 'online';
  };
  createdBy: string; // username of the user who created the bill
  processedBy?: string; // username of the user who processed the payment
}

export interface ClinicSettings {
  defaultConsultationFee: number;
  appointmentSettings: {
    startTime: string;
    endTime: string;
    slotDuration: number;
  };
}
