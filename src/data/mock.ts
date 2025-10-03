import { User, Patient, Doctor, Appointment, Bill, Expense, TreatmentPlan, Prescription } from '../types';

export const users: User[] = [
  { id: '1', username: 'owner', role: 'owner', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', username: 'doctor', role: 'doctor', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', username: 'staff', role: 'staff', createdAt: new Date(), updatedAt: new Date() },
  { id: '4', username: 'patient1', role: 'patient', createdAt: new Date(), updatedAt: new Date() },
  { id: '5', username: 'patient-register', role: 'patient-register', createdAt: new Date(), updatedAt: new Date() },
];

export const patients: Patient[] = [
  {
    id: 'p1',
    name: 'John Doe',
    age: 33,
    gender: 'male',
    contact: { phone: '1234567890', address: '123 Main St' },
    medicalHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const doctors: Doctor[] = [
  {
    id: 'd1',
    userId: '2',
    firstName: 'Alice',
    lastName: 'Smith',
    specialty: 'General Dentistry',
    contact: { phone: '555-1234', email: 'dr.smith@clinic.com' },
    availability: [
        'Monday: 09:00-17:00',
        'Wednesday: 09:00-17:00',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const staff: any[] = [
    {
        id: 's1',
        userId: '3',
        firstName: 'Bob',
        lastName: 'Brown',
        role: 'staff',
        contact: { phone: '555-5678', email: 'bob.brown@clinic.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const appointments: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    startTime: new Date('2023-10-26T10:00:00Z'),
    endTime: new Date('2023-10-26T11:00:00Z'),
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const bills: Bill[] = [
  {
    id: 'b1',
    patientId: 'p1',
    appointmentId: 'a1',
    amount: 150.00,
    status: 'unpaid',
    items: [{ description: 'Consultation', cost: 500 }],
    issuedAt: new Date('2025-08-10'),
    createdBy: 'doctor',
  },
];

export const treatmentPlans: TreatmentPlan[] = [
    {
        id: 'tp-1',
        patientId: 'p-1',
        name: 'Root Canal Therapy',
        costEstimate: 25000,
        status: 'active',
        createdAt: new Date('2025-08-10'),
    },
    {
        id: 'tp-2',
        patientId: 'p-2',
        name: 'Wisdom Tooth Extraction',
        costEstimate: 15000,
        status: 'completed',
        createdAt: new Date('2025-07-20'),
    }
];

export const expenses: Expense[] = [
    {
        id: 'e1',
        description: 'Dental supplies',
        amount: 5000,
        date: new Date('2025-08-01'),
        category: 'supplies',
        method: 'cash',
        createdBy: 'owner',
    },
    {
        id: 'e2',
        description: 'Staff salaries',
        amount: 25000,
        date: new Date('2025-08-01'),
        category: 'salaries',
        method: 'online',
        createdBy: 'owner',
    }
];
export const prescriptions: Prescription[] = [
    {
        id: 'rx-1',
        patientId: 'p1',
        doctorId: 'd1',
        date: new Date('2025-08-10'),
        medications: [
            { name: 'Amoxicillin', dosage: '500mg', frequency: 'Every 8 hours', duration: '7 days' },
            { name: 'Ibuprofen', dosage: '600mg', frequency: 'As needed for pain', duration: '5 days' }
        ],
        notes: 'Take Amoxicillin with food. Finish the entire course of antibiotics.'
    },
    {
        id: 'rx-2',
        patientId: 'p2',
        doctorId: 'd1',
        date: new Date('2025-07-20'),
        medications: [
            { name: 'Metformin', dosage: '1000mg', frequency: 'Once daily with dinner', duration: 'Ongoing' }
        ],
    }
];

