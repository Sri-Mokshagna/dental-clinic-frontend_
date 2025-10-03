'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ApiService } from '@/lib/api';
import { Patient, User } from '@/types';

function buildWhatsAppLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${digits}?text=${encoded}`;
}

export default function AdminActions() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [promoText, setPromoText] = useState('Hello from The Dental Experts! Enjoy our latest offers.');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    role: 'DOCTOR',
    username: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    email: '',
  });

  const [inbox, setInbox] = useState<Array<{ id?: string; fromName: string; fromPhone: string; message: string; receivedAt: string }>>([]);

  useEffect(() => {
    ApiService.getPatients().then((p) => setPatients(p as any)).catch(() => setPatients([]));
    fetch('http://localhost:8080/api/whatsapp/messages')
      .then(r => r.json())
      .then((list) => {
        const mapped = (list as any[]).map(m => ({
          id: m.id,
          fromName: m.fromName || 'Unknown',
          fromPhone: (m.fromPhone || '').replace('whatsapp:', ''),
          message: m.message || '',
          receivedAt: m.receivedAt || new Date().toISOString(),
        }));
        setInbox(mapped);
      })
      .catch(() => {});
  }, []);

  const patientContacts = useMemo(() => patients.filter(p => !!p.phoneNumber), [patients]);

  const sendPromoToAll = async () => {
    const text = promoText || '';
    await fetch('http://localhost:8080/api/whatsapp/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    }).catch(() => {});
    alert('Broadcast requested. Messages will be sent via backend.');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const payload: any = { ...newUser, role: newUser.role };
      await ApiService.createUser(payload);
      setNewUser({ role: 'DOCTOR', username: '', password: '', fullName: '', phoneNumber: '', email: '' });
      alert('User created successfully');
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Add Doctor/Staff */}
      <div className="bg-white p-4 shadow rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Add Doctor/Staff</h3>
        {createError && <p className="text-red-600 text-sm mb-2">{createError}</p>}
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Role</label>
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full p-2 border rounded">
              <option value="DOCTOR">Doctor</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Full Name</label>
            <input value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Phone</label>
            <input value={newUser.phoneNumber} onChange={e => setNewUser({ ...newUser, phoneNumber: e.target.value })} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full p-2 border rounded" />
          </div>
          <div className="md:col-span-2 text-right">
            <button disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded">{creating ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </div>

      {/* Promotional WhatsApp */}
      <div className="bg-white p-4 shadow rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Send Promotional WhatsApp Message</h3>
        <textarea className="w-full p-2 border rounded mb-3" rows={3} value={promoText} onChange={e => setPromoText(e.target.value)} />
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Recipients: {patientContacts.length}</p>
          <button onClick={sendPromoToAll} className="px-4 py-2 bg-green-600 text-white rounded">Send to All</button>
        </div>
        {patientContacts.length === 0 && <p className="p-2 text-sm text-gray-500 mt-2">No patient contacts available.</p>}
        <p className="text-xs text-gray-500 mt-2">This opens WhatsApp chats for each recipient. For true broadcast, integrate WhatsApp Business API.</p>
      </div>

      {/* WhatsApp Notifications (Mock Inbox) */}
      <div className="bg-white p-4 shadow rounded-lg lg:col-span-2">
        <h3 className="text-lg font-semibold mb-3">WhatsApp Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {inbox.length === 0 && <p className="text-sm text-gray-500">No WhatsApp notifications.</p>}
          {inbox.map(msg => (
            <div key={msg.id} className="border rounded p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold">{msg.fromName}</p>
                <span className="text-xs text-gray-500">{new Date(msg.receivedAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2 line-clamp-3">{msg.message}</p>
              <a href={buildWhatsAppLink(msg.fromPhone, '')} target="_blank" rel="noreferrer" className="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded">Chat</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


