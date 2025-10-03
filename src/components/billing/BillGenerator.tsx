'use client';

import { useState } from 'react';
import { Patient, Bill } from '@/types';
import { ApiService } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';

interface BillGeneratorProps {
  patient: Patient;
  onBillCreated: () => void;
}

export default function BillGenerator({ patient, onBillCreated }: BillGeneratorProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    items: [{ description: '', cost: 0 }]
  });
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'online',
    notes: ''
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [createdBillId, setCreatedBillId] = useState<string | null>(null);

  const currentUser = getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      
      const total = calculateTotal();
      const billData = {
        patientId: patient.id,
        amount: total,
        status: 'unpaid',
        items: formData.items.filter(item => item.description.trim() && item.cost > 0),
        createdBy: currentUser.username
      };

      const bill = await ApiService.createBill(billData);
      setCreatedBillId(bill.id);
      
      // Reset form
      setFormData({
        description: '',
        amount: 0,
        items: [{ description: '', cost: 0 }]
      });
      
      setShowForm(false);
      onBillCreated();
      
      // If user selected Paid in the form, immediately record payment
      if (isPaid) {
        try {
          await fetch('http://localhost:8080/api/billing/record-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              billId: bill.id,
              amount: total,
              paymentMethod: paymentMethod
            })
          });
          onBillCreated();
        } catch (err) {}
      } else {
        // Optional follow-up to send via WhatsApp
        if (window.confirm('Bill created successfully! Would you like to send it to the patient via WhatsApp?')) {
          await sendBillToWhatsApp(bill);
        }
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Error creating bill');
    } finally {
      setLoading(false);
    }
  };

  const sendBillToWhatsApp = async (bill: Bill) => {
    if (!patient.phoneNumber) {
      alert('Patient phone number not available');
      return;
    }

    try {
      setSendingWhatsApp(true);
      const name = patient.fullName || 'Patient';
      const message = `Hello ${name}, your bill has been generated.\n\nBill Details:\nAmount: ₹${bill.amount}\nStatus: ${bill.status}\n\nPlease contact us for payment.`;
      
      await ApiService.sendFileToWhatsApp(
        patient.phoneNumber,
        message,
        `Bill-${bill.id}.pdf`,
        `${window.location.origin}/dashboard/billing/invoice/${bill.id}`
      );
      
      alert('Bill sent to WhatsApp successfully!');
    } catch (error) {
      console.error('Error sending to WhatsApp:', error);
      alert('Failed to send bill to WhatsApp');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', cost: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: 'description' | 'cost', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.cost || 0), 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!createdBillId) {
      alert('No bill to record payment for. Please create a bill first.');
      return;
    }

    try {
      setLoading(true);
      
      // Record payment
      const paymentResponse = await fetch('http://localhost:8080/api/billing/record-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billId: typeof createdBillId === 'string' ? parseInt(createdBillId as any, 10) : createdBillId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod
        }),
      });

      if (paymentResponse.ok) {
        alert('Payment recorded successfully!');
        setShowPaymentForm(false);
        setPaymentData({
          amount: 0,
          paymentMethod: 'cash',
          notes: ''
        });
        onBillCreated(); // Refresh parent data
      } else {
        throw new Error('Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white py-2 px-4 rounded-md text-sm hover:bg-green-600"
        >
          + Generate New Bill
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 shadow-md rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-4">Generate New Bill</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bill Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded-md"
            placeholder="e.g., Dental Treatment - Root Canal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bill Items
          </label>
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                  placeholder="Item description"
                />
                <input
                  type="number"
                  value={item.cost}
                  onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value) || 0)}
                  className="w-24 p-2 border rounded-md"
                  placeholder="Cost"
                  min="0"
                  step="0.01"
                />
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-3 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total: ₹{calculateTotal().toFixed(2)}
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Paid?</label>
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
              />
            </div>
            {isPaid && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Method</label>
                <select
                  className="p-2 border rounded-md"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'online')}
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-60"
              disabled={loading || calculateTotal() <= 0}
            >
              {loading ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </div>
      </form>

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Record Payment</h3>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter payment amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'online' }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Enter payment notes..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60"
                  disabled={loading || paymentData.amount <= 0}
                >
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
