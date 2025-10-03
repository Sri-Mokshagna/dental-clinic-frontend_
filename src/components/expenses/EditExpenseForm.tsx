'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { getCurrentUser } from '@/lib/session';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface EditExpenseFormProps {
    expense: Expense;
    onSave: (expense: Expense) => void;
    onCancel: () => void;
}

export default function EditExpenseForm({ expense, onSave, onCancel }: EditExpenseFormProps) {
    const [description, setDescription] = useState(expense.description);
    const [amount, setAmount] = useState(expense.amount);
    const [category, setCategory] = useState(expense.category);
    const [method, setMethod] = useState(expense.method);
    const [date, setDate] = useState(expense.date);
    const currentUser = getCurrentUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...expense,
            description,
            amount,
            category,
            method,
            date,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit Expense</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="edit-description" className="block text-sm font-medium">Description</label>
                        <input
                            id="edit-description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-amount" className="block text-sm font-medium">Amount (₹)</label>
                        <input
                            id="edit-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-category" className="block text-sm font-medium">Category</label>
                        <select
                            id="edit-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as 'supplies' | 'salaries' | 'rent' | 'utilities' | 'other')}
                            className="w-full p-2 border rounded"
                        >
                            <option value="supplies">Supplies</option>
                            <option value="salaries">Salaries</option>
                            <option value="rent">Rent</option>
                            <option value="utilities">Utilities</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="edit-method" className="block text-sm font-medium">Method</label>
                        <select
                            id="edit-method"
                            value={method}
                            onChange={(e) => setMethod(e.target.value as 'cash' | 'online')}
                            className="w-full p-2 border rounded"
                        >
                            <option value="cash">Cash</option>
                            <option value="online">Online</option>
                        </select>
                    </div>
                    {currentUser?.role === 'owner' && (
                        <div className="mb-4">
                            <label htmlFor="edit-date" className="block text-sm font-medium">Date</label>
                            <DatePicker
                                id="edit-date"
                                selected={date}
                                onChange={(date: Date) => setDate(date)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    )}
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
