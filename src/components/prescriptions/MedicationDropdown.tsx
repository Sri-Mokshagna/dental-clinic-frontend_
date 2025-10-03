'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api';

interface Medication {
  id: number;
  name: string;
  description?: string;
  type: string;
  dosage?: string;
  manufacturer?: string;
}

interface MedicationDropdownProps {
  onMedicationSelect: (medication: Medication) => void;
  selectedMedications: Medication[];
  placeholder?: string;
}

export default function MedicationDropdown({ 
  onMedicationSelect, 
  selectedMedications, 
  placeholder = "Search medications..." 
}: MedicationDropdownProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) return;

    try {
      setLoading(true);
      const data = await ApiService.getMedications();
      // Filter medications based on search term
      const filtered = data.filter(medication => 
        medication.name.toLowerCase().includes(term.toLowerCase()) ||
        (medication.description && medication.description.toLowerCase().includes(term.toLowerCase()))
      );
      setMedications(filtered);
    } catch (error) {
      console.error('Error searching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = medications.filter(medication => {
    const isAlreadySelected = selectedMedications.some(selected => selected.id === medication.id);
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (medication.description && medication.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return !isAlreadySelected && matchesSearch;
  });

  const handleMedicationClick = (medication: Medication) => {
    onMedicationSelect(medication);
    setSearchTerm('');
    setIsOpen(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tablet': return 'bg-blue-100 text-blue-800';
      case 'syrup': return 'bg-green-100 text-green-800';
      case 'injection': return 'bg-red-100 text-red-800';
      case 'tool': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredMedications.length > 0 ? (
            filteredMedications.map(medication => (
              <div
                key={medication.id}
                onClick={() => handleMedicationClick(medication)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{medication.name}</div>
                    <div className="text-sm text-gray-600">
                      {medication.dosage && <span>Dosage: {medication.dosage}</span>}
                      {medication.manufacturer && <span className="ml-2">Manufacturer: {medication.manufacturer}</span>}
                    </div>
                    {medication.description && (
                      <div className="text-xs text-gray-500 mt-1">{medication.description}</div>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${getTypeColor(medication.type)}`}>
                    {medication.type}
                  </span>
                </div>
              </div>
            ))
          ) : searchTerm.length >= 2 ? (
            <div className="p-3 text-gray-500 text-center">
              No medications found for "{searchTerm}"
            </div>
          ) : (
            <div className="p-3 text-gray-500 text-center">
              Type to search medications...
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
