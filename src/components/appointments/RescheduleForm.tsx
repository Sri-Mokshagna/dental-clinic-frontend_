'use client';

import { useState, useEffect } from 'react';
import { Appointment } from '@/types';
import { ApiService } from '@/lib/api';

interface RescheduleFormProps {
  appointment: Appointment;
  onSave: () => void;
  onCancel: () => void;
}

function generateTimeSlots(startTime: string, endTime: string, slotDuration: number) {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;

  while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
    slots.push(`${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
    
    currentMinute += slotDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute %= 60;
    }
  }
  
  return slots;
}

export default function RescheduleForm({ appointment, onSave, onCancel }: RescheduleFormProps) {
  const [date, setDate] = useState(new Date(appointment.appointmentDate).toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Generate time slots based on clinic settings
    try {
      // Backend doesn't expose clinic settings yet; use default slots
      const fallbackSlots = [] as string[];
      for (let i = 10; i < 20; i++) {
        fallbackSlots.push(`${i.toString().padStart(2, '0')}:00`);
        fallbackSlots.push(`${i.toString().padStart(2, '0')}:30`);
      }
      setTimeSlots(fallbackSlots);
    } catch (error) {
      // Fallback to default time slots
      const fallbackSlots = [];
      for (let i = 10; i < 20; i++) {
        fallbackSlots.push(`${i.toString().padStart(2, '0')}:00`);
        fallbackSlots.push(`${i.toString().padStart(2, '0')}:30`);
      }
      setTimeSlots(fallbackSlots);
    }
    
    // Set initial time to current appointment time (formatted correctly)
    const appointmentTime = new Date(appointment.appointmentDate);
    const formattedTime = `${appointmentTime.getHours().toString().padStart(2, '0')}:${appointmentTime.getMinutes().toString().padStart(2, '0')}`;
    setTime(formattedTime);
  }, [appointment.appointmentDate]);

  const validateDateTime = (selectedDate: string, selectedTime: string) => {
    if (!selectedDate || !selectedTime) return false;
    
    const [hours, minutes] = selectedTime.split(':');
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    const now = new Date();
    
    return selectedDateTime >= now;
  };

  const handleSave = () => {
    if (!date || !time) {
      setError('Please select both date and time.');
      return;
    }

    if (!validateDateTime(date, time)) {
      setError('Cannot reschedule to past date and time.');
      return;
    }
    
    const [hours, minutes] = time.split(':');
    const newStartTime = new Date(date);
    newStartTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    const iso = newStartTime.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss
    ApiService.updateAppointment(String(appointment.id), {
      appointmentDate: iso,
    })
      .then(() => onSave())
      .catch(() => setError('Failed to reschedule.'));
  };

  return (
    <div className="my-2 p-4 bg-gray-50 border rounded-lg">
      <h4 className="font-bold text-lg mb-3">Reschedule Appointment</h4>
      
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            id="reschedule-date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setError('');
            }}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="reschedule-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <select
            id="reschedule-time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setError('');
            }}
            className={`w-full p-2 border rounded-md ${
              date && time && !validateDateTime(date, time) 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300'
            }`}
          >
            <option value="">Select a time</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          {date && time && !validateDateTime(date, time) && (
            <p className="text-red-500 text-xs mt-1">Selected time is in the past</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleSave} 
          className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600 transition-colors"
        >
          Save Changes
        </button>
        <button 
          onClick={onCancel} 
          className="bg-gray-500 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
