import React from 'react';
import { Patient, Appointment, Prescription, Bill } from '@/types';
import { formatDateTime, formatDate } from '@/lib/utils';

interface PrintableSummaryProps {
  patient: Patient;
  appointments: Appointment[];
  prescriptions: Prescription[];
  bills: Bill[];
}

const PrintableSummary: React.FC<PrintableSummaryProps> = ({ patient, appointments, prescriptions, bills }) => {
  const totalBilled = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.amount, 0);
  const amountDue = totalBilled - totalPaid;

  const styles = {
    container: { padding: '32px', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'sans-serif' },
    header: { textAlign: 'center' as const, marginBottom: '32px' },
    h1: { fontSize: '2rem', fontWeight: 'bold' },
    h2: { fontSize: '1.25rem', fontWeight: '600', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '12px' },
    section: { marginBottom: '24px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' },
    colSpan2: { gridColumn: 'span 2 / span 2' },
    strong: { fontWeight: '600' },
    appointment: { padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' },
    table: { width: '100%', textAlign: 'left' as const },
    th: { padding: '8px', backgroundColor: '#f3f4f6' },
    td: { padding: '8px', borderBottom: '1px solid #e5e7eb' },
    billingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', textAlign: 'center' as const },
    billingBox: { padding: '16px', borderRadius: '8px' },
    blueBox: { backgroundColor: '#dbeafe' },
    greenBox: { backgroundColor: '#d1fae5' },
    redBox: { backgroundColor: '#fee2e2' },
    billingAmount: { fontSize: '1.125rem', fontWeight: 'bold' },
    billingLabel: { fontSize: '0.875rem' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header} className="printable-section">
        <h1 style={styles.h1}>{patient.fullName} - Patient Summary</h1>
        <p style={{fontSize: '0.875rem', color: '#6b7280'}}>Generated on: {formatDate(new Date())}</p>
      </div>

      {/* Patient Details */}
      <div style={styles.section} className="printable-section">
        <h2 style={styles.h2}>Patient Details</h2>
        <div style={styles.grid}>
          <p><strong style={styles.strong}>Name:</strong> {patient.fullName}</p>
          <p><strong style={styles.strong}>Age:</strong> {patient.age || 'N/A'}</p>
          <p><strong style={styles.strong}>Phone:</strong> {patient.phoneNumber}</p>
          <p><strong style={styles.strong}>Email:</strong> {patient.email}</p>
          <p style={styles.colSpan2}><strong style={styles.strong}>Address:</strong> {patient.address}</p>
          {patient.medicalInfo && <p style={styles.colSpan2}><strong style={styles.strong}>Medical Information:</strong> {patient.medicalInfo}</p>}
        </div>
      </div>

      {/* Appointments History */}
      <div style={styles.section} className="printable-section">
        <h2 style={styles.h2}>Appointment History</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {appointments.map(app => (
            <div key={app.id} style={styles.appointment}>
              <p style={{fontWeight: 'bold'}}>{formatDateTime(app.appointmentDate)} - <span style={{textTransform: 'capitalize'}}>{app.treatmentDetails}</span></p>
              <p><strong style={styles.strong}>Treatment Details:</strong> {app.treatmentDetails}</p>
              <p><strong style={styles.strong}>Cost:</strong> ₹{app.treatmentCost}</p>
              {app.doctor && <p><strong style={styles.strong}>Doctor:</strong> {app.doctor.fullName}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Medical Notes */}
      <div style={styles.section} className="printable-section">
        <h2 style={styles.h2}>Medical Notes</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {patient.medicalInfo ? (
            <div style={styles.appointment}>
              <p style={{fontWeight: 'bold'}}>Current Medical Information</p>
              <p>{patient.medicalInfo}</p>
            </div>
          ) : (
            <p style={{color: '#6b7280', fontStyle: 'italic'}}>No medical notes recorded</p>
          )}
        </div>
      </div>

      {/* Prescribed Medications */}
      <div style={styles.section} className="printable-section">
        <h2 style={styles.h2}>Prescribed Medications</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Medication</th>
              <th style={styles.th}>Dosage</th>
              <th style={styles.th}>Frequency</th>
              <th style={styles.th}>Prescribed On</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.flatMap(pres => 
                pres.medications.map((med, index) => (
                    <tr key={`${pres.id}-${index}`}>
                        <td style={styles.td}>{med.name}</td>
                        <td style={styles.td}>{med.dosage}</td>
                        <td style={styles.td}>{med.frequency}</td>
                        <td style={styles.td}>{formatDate(new Date(pres.date))}</td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Billing Summary */}
      <div className="printable-section">
        <h2 style={styles.h2}>Billing Summary</h2>
        <div style={styles.billingGrid}>
          <div style={{...styles.billingBox, ...styles.blueBox}}>
            <p style={styles.billingAmount}>₹{totalBilled.toFixed(2)}</p>
            <p style={styles.billingLabel}>Total Billed</p>
          </div>
          <div style={{...styles.billingBox, ...styles.greenBox}}>
            <p style={styles.billingAmount}>₹{totalPaid.toFixed(2)}</p>
            <p style={styles.billingLabel}>Total Paid</p>
          </div>
          <div style={{...styles.billingBox, ...styles.redBox}}>
            <p style={styles.billingAmount}>₹{amountDue.toFixed(2)}</p>
            <p style={styles.billingLabel}>Amount Due</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PrintableSummary;
