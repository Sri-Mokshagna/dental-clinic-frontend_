'use client';

import React, { useState, useEffect } from 'react';
import { Bill } from '@/types';
import { ApiService } from '@/lib/api';

interface EditBillFormProps {
  bill: Bill;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditBillForm({ bill, onSave, onCancel }: EditBillFormProps) {
  const [items, setItems] = useState(bill.items);

  const handleItemChange = (index: number, field: 'description' | 'cost', value: string | number) => {
    const newItems = [...items];
    if (field === 'cost') {
      newItems[index][field] = Number(value);
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', cost: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = items.reduce((sum, item) => sum + item.cost, 0);
    const updated = { items, amount: totalAmount } as any;
    ApiService.updateBill(String(bill.id), updated).then(onSave);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <h2 className="text-xl font-bold mb-4">Edit Bill</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Item Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={item.cost}
                  onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
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
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
