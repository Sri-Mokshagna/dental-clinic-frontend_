'use client';

import React, { useState } from 'react';
import { Bill, Patient } from '@/types';
import { toast } from 'react-toastify';
import { ApiService } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface PaymentFormProps {
  patient: Patient;
  onSave: () => void;
  onClose: () => void;
}

export default function PaymentForm({ patient, onSave, onClose }: PaymentFormProps) {
  const [items, setItems] = useState<{ description: string; cost: string }[]>([{ description: '', cost: '' }]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online' | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [error, setError] = useState<string>('');
  const currentUser = getCurrentUser();

  const presetItems = ["Consultation", "Cleaning", "X-Ray", "Medication", "Lab Test"];

  const handleItemChange = (index: number, field: 'description' | 'cost', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', cost: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedItems = items.map(item => ({...item, cost: parseFloat(item.cost) || 0}));

    if (parsedItems.some(item => !item.description || item.cost <= 0)) {
      setError('Please add at least one valid item with a cost greater than 0.');
      return;
    }
    if (!paymentMethod) {
      setError('Please select a payment method.');
      return;
    }

    const totalAmount = parsedItems.reduce((sum, item) => sum + item.cost, 0);
    const payload: any = {
      patientId: patient.id,
      amount: totalAmount,
      status: 'PAID',
      items: parsedItems,
      createdById: currentUser?.id,
    };
    ApiService.createBill(payload)
      .then(() => { toast.success('Payment recorded'); onSave(); })
      .catch(() => { toast.error('Failed to record payment'); });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <h2 className="text-xl font-bold mb-4">Record Payment for {patient.fullName}</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  list="preset-items"
                  type="text"
                  placeholder="Item Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <datalist id="preset-items">
                  {presetItems.map(preset => <option key={preset} value={preset} />)}
                </datalist>

                <input
                  type="number"
                  placeholder="Cost"
                  value={item.cost}
                  onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-blue-500 hover:underline mb-4"
          >
            + Add Another Item
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'online')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Select a method</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
            </div>
            {currentUser?.role === 'owner' && (
              <div>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Payment Date</label>
                <DatePicker
                  id="paymentDate"
                  selected={paymentDate}
                  onChange={(date: Date) => setPaymentDate(date)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


