'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/session';
import { ApiService } from '@/lib/api';

interface Medication {
  id: number;
  name: string;
  description?: string;
  type: string;
  dosage?: string;
  manufacturer?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MedicationManagerProps {
  onMedicationUpdate: () => void;
}

export default function MedicationManager({ onMedicationUpdate }: MedicationManagerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentUser] = useState(getCurrentUser());
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'tablet',
    dosage: '',
    manufacturer: '',
    isActive: true
  });

  const medicationTypes = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'syrup', label: 'Syrup' },
    { value: 'injection', label: 'Injection' },
    { value: 'tool', label: 'Tool' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getMedications();
      setMedications(data);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (editingMedication) {
        await ApiService.updateMedication(String(editingMedication.id), formData);
      } else {
        await ApiService.createMedication(formData);
      }
      
      resetForm();
      await loadMedications();
      onMedicationUpdate();
    } catch (error) {
      console.error('Error saving medication:', error);
      alert('Error saving medication');
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      description: medication.description || '',
      type: medication.type,
      dosage: medication.dosage || '',
      manufacturer: medication.manufacturer || '',
      isActive: medication.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (medicationId: number) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) return;

    try {
      await ApiService.deleteMedication(String(medicationId));
      await loadMedications();
      onMedicationUpdate();
    } catch (error) {
      console.error('Error deleting medication:', error);
      alert('Error deleting medication');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'tablet',
      dosage: '',
      manufacturer: '',
      isActive: true
    });
    setShowForm(false);
    setEditingMedication(null);
  };

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (medication.description && medication.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !filterType || medication.type === filterType;
    return matchesSearch && matchesType;
  });

  if (currentUser?.role !== 'owner') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-lg font-bold mb-4">
            {editingMedication ? 'Edit Medication' : 'Add New Medication'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  {medicationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., 500mg, 10ml"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
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
                {editingMedication ? 'Update Medication' : 'Add Medication'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header and Filters */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Medication Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
        >
          + Add Medication
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Types</option>
              {medicationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medications List */}
      <div className="bg-white p-4 shadow-md rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          Medications ({filteredMedications.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-4">Loading medications...</div>
        ) : filteredMedications.length > 0 ? (
          <div className="space-y-3">
            {filteredMedications.map(medication => (
              <div key={medication.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{medication.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      medication.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {medication.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {medication.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {medication.dosage && <span>Dosage: {medication.dosage}</span>}
                    {medication.manufacturer && <span className="ml-2">Manufacturer: {medication.manufacturer}</span>}
                  </div>
                  {medication.description && (
                    <p className="text-sm text-gray-500 mt-1">{medication.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(medication)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(medication.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No medications found</p>
        )}
      </div>
    </div>
  );
}
