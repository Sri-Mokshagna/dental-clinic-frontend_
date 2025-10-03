'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    age: ''
  });

  const WHATSAPP_NUMBER = '+918125439878'; // replace with your clinic's WhatsApp number

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isFormValid = Object.values(formData).every(val => val.trim() !== '');

  const handleWhatsAppBooking = () => {
    if (!isFormValid) return;

    const message = `*New Appointment Request*\n\nName: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}\nEmail: ${formData.email}\nAge: ${formData.age}`;

    // open WhatsApp chat with prefilled message
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to The Dental Experts</h1>
        <p className="text-xl mb-8">Your complete clinic management solution.</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Staff Login
          </Link>
          <Link
            href="/patient-portal"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Patient Portal
          </Link>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Book Appointment</h2>
            <form className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isFormValid}
                  onClick={handleWhatsAppBooking}
                  className={`px-4 py-2 rounded text-white ${
                    isFormValid
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Book via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
