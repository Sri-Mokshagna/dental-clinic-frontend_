'use client';

import { useState, useEffect } from 'react';
import { Appointment, Patient } from '@/types';
import { ApiService } from '@/lib/api';
import RescheduleForm from './RescheduleForm';
import { formatDateTime } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import Link from 'next/link';

interface AppointmentDetailModalProps {
    appointment: Appointment;
    patient?: Patient;
    onClose: () => void;
    onUpdate: () => void;
}

export default function AppointmentDetailModal({ appointment, patient, onClose, onUpdate }: AppointmentDetailModalProps) {
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [history, setHistory] = useState<Appointment[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
    const currentUser = getCurrentUser();

    useEffect(() => {
        if (patient) {
            ApiService.getAppointments()
                .then(allAppointments => {
                    const patientHistory = allAppointments
                        .filter((app: Appointment) => app.patient && app.patient.id === patient.id && app.id !== appointment.id)
                        .sort((a: Appointment, b: Appointment) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());
                    setHistory(patientHistory);
                })
                .catch(() => setHistory([]));
        }
    }, [patient, appointment.id]);

    const handleStatusChange = async (status: 'completed' | 'cancelled') => {
        try {
            // Update appointment status
            await ApiService.updateAppointment(String(appointment.id), {
                ...appointment,
                status: status
            });
            
            if (status === 'completed') {
                setIsCompleted(true);
            }
            
            onUpdate();
            alert(`Appointment ${status} successfully!`);
        } catch (error) {
            console.error('Error updating appointment status:', error);
            alert('Failed to update appointment status');
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            handleStatusChange('cancelled');
        }
    };

    const handleComplete = () => {
        if (window.confirm('Mark this appointment as completed?')) {
            handleStatusChange('completed');
        }
    };

    const sendWhatsAppFile = async () => {
        if (!patient?.phoneNumber) {
            alert('Patient phone number not available');
            return;
        }

        try {
            setSendingWhatsApp(true);
            const message = `Hello ${patient.fullName}, your appointment details:\n\nDate: ${formatDateTime(new Date(appointment.appointmentDate))}\nTreatment: ${appointment.treatmentDetails}\nCost: ₹${appointment.treatmentCost}`;
            
            await ApiService.sendFileToWhatsApp(
                patient.phoneNumber,
                message,
                `Appointment-${appointment.id}.pdf`,
                `${window.location.origin}/dashboard/appointments/${appointment.id}`
            );
            
            alert('Appointment details sent to WhatsApp successfully!');
        } catch (error) {
            console.error('Error sending to WhatsApp:', error);
            alert('Failed to send to WhatsApp');
        } finally {
            setSendingWhatsApp(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Appointment Details</h2>
                
                {!isRescheduling ? (
                    <>
                        <div className="space-y-2 mb-6 border-b pb-4">
                            <p><strong>Patient:</strong> {patient?.fullName || 'Loading...'}</p>
                            <p><strong>Date & Time:</strong> {formatDateTime(new Date(appointment.appointmentDate))}</p>
                            <p><strong>Treatment:</strong> {appointment.treatmentDetails}</p>
                            <p><strong>Cost:</strong> ₹{appointment.treatmentCost}</p>
                            {appointment.doctor && <p><strong>Doctor:</strong> {appointment.doctor.fullName}</p>}
                            {appointment.staff && <p><strong>Staff:</strong> {appointment.staff.fullName}</p>}
                        </div>

                        {history.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">Past Appointments</h3>
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {history.map(app => (
                                        <li key={app.id} className="text-sm p-2 bg-gray-50 rounded-md">
                                            {formatDateTime(app.startTime)} - <span className="capitalize font-medium">{app.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-wrap justify-end gap-2">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Close</button>
                            
                            {/* Staff and Doctor actions */}
                            {(currentUser?.role === 'staff' || currentUser?.role === 'doctor' || currentUser?.role === 'owner') && (
                                <>
                                    <button 
                                        onClick={() => setIsRescheduling(true)} 
                                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                    >
                                        Reschedule
                                    </button>
                                    
                                    <button 
                                        onClick={handleCancel} 
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Cancel
                                    </button>
                                    
                                    <button 
                                        onClick={handleComplete} 
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                    >
                                        Mark Complete
                                    </button>
                                    
                                    <button 
                                        onClick={sendWhatsAppFile} 
                                        disabled={sendingWhatsApp}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {sendingWhatsApp ? 'Sending...' : 'Send via WhatsApp'}
                                    </button>
                                </>
                            )}
                            
                            {/* View Billing option for completed appointments */}
                            {isCompleted && patient && (
                                <Link 
                                    href={`/dashboard/billing/patient/${patient.id}`}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                                >
                                    View Billing
                                </Link>
                            )}
                        </div>
                    </>
                ) : (
                    <RescheduleForm 
                        appointment={appointment}
                        onSave={() => {
                            setIsRescheduling(false);
                            onUpdate();
                            onClose(); // Close the modal after successful reschedule
                        }}
                        onCancel={() => setIsRescheduling(false)}
                    />
                )}
            </div>
        </div>
    );
}
