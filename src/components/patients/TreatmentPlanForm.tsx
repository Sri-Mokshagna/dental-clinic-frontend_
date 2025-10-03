'use client';

import { useState } from 'react';
import { TreatmentPlan } from '@/types';
import { addTreatmentPlan } from '@/lib/data-manager';

interface TreatmentPlanFormProps {
  patientId: string;
  onSave: () => void;
}

export default function TreatmentPlanForm({ patientId, onSave }: TreatmentPlanFormProps) {
  const [name, setName] = useState('');
  const [estimate, setEstimate] = useState(0);

  const handleSave = () => {
    if (!name || estimate <= 0) {
      alert('Please provide a name and a valid estimate.');
      return;
    }

    const newPlan: TreatmentPlan = {
      id: `tp-${Date.now()}`,
      patientId,
      name,
      costEstimate: estimate,
      status: 'active',
      createdAt: new Date(),
    };

    addTreatmentPlan(newPlan);
    onSave();
    setName('');
    setEstimate(0);
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h3 className="font-bold text-lg mb-2">Create New Treatment Plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Plan Name (e.g., Root Canal)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Cost Estimate"
          value={estimate}
          onChange={(e) => setEstimate(parseFloat(e.target.value) || 0)}
          className="p-2 border rounded"
        />
        <button onClick={handleSave} className="bg-blue-500 text-white py-2 px-4 rounded">
          Create Plan
        </button>
      </div>
    </div>
  );
}
