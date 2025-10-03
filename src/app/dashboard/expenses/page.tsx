'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import EditExpenseForm from '@/components/expenses/EditExpenseForm';

export default function ExpensesPage() {
    const { expenses, createExpense, deleteExpense, updateExpense, approveExpense, rejectExpense, loading } = useData();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !description || amount === '' || amount <= 0) {
            alert('Please fill out all fields correctly.');
            return;
        }

        try {
            await createExpense({
                description,
                amount: amount as number,
                date: expenseDate,
                approved: user.role === 'ADMIN',
                addedById: user.id,
            });
            setDescription('');
            setAmount('');
            setExpenseDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error('Error creating expense:', error);
            alert('Error creating expense. Please try again.');
        }
    };

    const handleDeleteExpense = async (expenseId: number) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this expense? This action cannot be undone.'
        );
        if (confirmed) {
            try {
                await deleteExpense(expenseId);
            } catch (error) {
                console.error('Error deleting expense:', error);
                alert('Error deleting expense. Please try again.');
            }
        }
    };

    const handleApproveExpense = async (expenseId: number) => {
        try {
            await approveExpense(expenseId);
        } catch (error) {
            console.error('Error approving expense:', error);
            alert('Error approving expense. Please try again.');
        }
    };

    const handleRejectExpense = async (expenseId: number) => {
        const confirmed = window.confirm(
            'Are you sure you want to reject this expense? This action cannot be undone.'
        );
        if (confirmed) {
            try {
                await rejectExpense(expenseId);
            } catch (error) {
                console.error('Error rejecting expense:', error);
                alert('Error rejecting expense. Please try again.');
            }
        }
    };

    const handleEditClick = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const handleUpdateExpense = async (updatedExpense: Expense) => {
        try {
            await updateExpense(updatedExpense.id, updatedExpense);
            setEditingExpense(null);
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Error updating expense. Please try again.');
        }
    };

    if (authLoading || !user) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (loading.expenses) {
        return <div className="flex items-center justify-center p-8">Loading expenses...</div>;
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'owner';
    const filteredExpenses = isAdmin ? expenses : expenses.filter(exp => exp.addedBy?.id === user.id);

    return (
        <div className="p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-4">Expenses</h1>
            
            <div className="bg-white p-4 shadow rounded-lg mb-6">
                <h2 className="text-xl font-bold mb-2">Add New Expense</h2>
                <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium">Description</label>
                        <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium">Amount (₹)</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label htmlFor="expenseDate" className="block text-sm font-medium">Date</label>
                        <input
                            type="date"
                            id="expenseDate"
                            value={expenseDate}
                            onChange={e => setExpenseDate(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded w-full">Add Expense</button>
                </form>
            </div>

            <div className="bg-white p-4 shadow rounded-lg">
                <h2 className="text-xl font-bold mb-2">Expense List</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-2 border-b whitespace-nowrap">Date</th>
                                <th className="p-2 border-b">Description</th>
                                <th className="p-2 border-b text-right whitespace-nowrap">Amount</th>
                                <th className="p-2 border-b whitespace-nowrap">Status</th>
                                <th className="p-2 border-b whitespace-nowrap">Added By</th>
                                {isAdmin && <th className="p-2 border-b whitespace-nowrap">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => (
                                <tr key={`expense-row-${exp.id}`}>
                                    <td className="p-2 border-b">{new Date(exp.date).toLocaleDateString()}</td>
                                    <td className="p-2 border-b">{exp.description}</td>
                                    <td className="p-2 border-b text-right">₹{exp.amount.toFixed(2)}</td>
                                    <td className="p-2 border-b">
                                        <span className={`px-2 py-1 rounded text-xs ${exp.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {exp.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-2 border-b">{exp.addedBy?.fullName || 'Unknown'}</td>
                                    {isAdmin && (
                                        <td className="p-2 border-b">
                                            {!exp.approved && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApproveExpense(exp.id)} 
                                                        className="text-green-500 hover:underline mr-2 whitespace-nowrap"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectExpense(exp.id)} 
                                                        className="text-orange-500 hover:underline mr-2 whitespace-nowrap"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleEditClick(exp)} className="text-blue-500 hover:underline mr-2 whitespace-nowrap">Edit</button>
                                            <button onClick={() => handleDeleteExpense(exp.id)} className="text-red-500 hover:underline whitespace-nowrap">Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingExpense && (
                <EditExpenseForm
                    expense={editingExpense}
                    onSave={handleUpdateExpense}
                    onCancel={() => setEditingExpense(null)}
                />
            )}
        </div>
    );
}
