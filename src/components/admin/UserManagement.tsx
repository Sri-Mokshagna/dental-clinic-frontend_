'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { ApiService } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';

interface UserManagementProps {
  onUserUpdate: () => void;
}

export default function UserManagement({ onUserUpdate }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentUser] = useState(getCurrentUser());
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    fullName: '',
    role: 'STAFF' as User['role'],
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await ApiService.getUsers();
      setUsers(userList as User[]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (editingUser) {
        await ApiService.updateUser(String(editingUser.id), formData);
      } else {
        await ApiService.createUser(formData);
      }
      
      setFormData({
        username: '',
        email: '',
        phoneNumber: '',
        fullName: '',
        role: 'STAFF',
        password: ''
      });
      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
      onUserUpdate();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      role: user.role,
      password: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await ApiService.deleteUser(String(userId));
      await loadUsers();
      onUserUpdate();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      phoneNumber: '',
      fullName: '',
      role: 'STAFF',
      password: ''
    });
    setShowForm(false);
    setEditingUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      case 'STAFF': return 'bg-green-100 text-green-800';
      case 'PATIENT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const doctors = users.filter(user => user.role === 'DOCTOR');
  const staff = users.filter(user => user.role === 'STAFF');

  return (
    <div className="space-y-6">
      {/* Add/Edit User Form */}
      {showForm && (
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-lg font-bold mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="STAFF">Staff</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required={!editingUser}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          + Add User
        </button>
      </div>

      {/* Doctors Section */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Doctors ({doctors.length})</h3>
        {loading ? (
          <div className="text-center py-4">Loading doctors...</div>
        ) : doctors.length > 0 ? (
          <div className="space-y-3">
            {doctors.map(doctor => (
              <div key={doctor.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-semibold">{doctor.fullName}</h4>
                  <p className="text-sm text-gray-600">{doctor.email} • {doctor.phoneNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getRoleColor(doctor.role)}`}>
                    {doctor.role}
                  </span>
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No doctors found</p>
        )}
      </div>

      {/* Staff Section */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Staff ({staff.length})</h3>
        {loading ? (
          <div className="text-center py-4">Loading staff...</div>
        ) : staff.length > 0 ? (
          <div className="space-y-3">
            {staff.map(staffMember => (
              <div key={staffMember.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-semibold">{staffMember.fullName}</h4>
                  <p className="text-sm text-gray-600">{staffMember.email} • {staffMember.phoneNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getRoleColor(staffMember.role)}`}>
                    {staffMember.role}
                  </span>
                  <button
                    onClick={() => handleEdit(staffMember)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(staffMember.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No staff found</p>
        )}
      </div>
    </div>
  );
}
