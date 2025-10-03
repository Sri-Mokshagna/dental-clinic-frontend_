'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function PendingExpenses() {
    const { pendingExpenses, approveExpense, rejectExpense, refreshPendingExpenses, loading } = useData();
    const { user } = useAuth();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'owner') {
            refreshPendingExpenses();
        }
    }, [user?.role]); // Only depend on user role, not the entire user object or function

    const handleApproveExpense = async (expenseId: number) => {
        try {
            await approveExpense(expenseId);
            await refreshPendingExpenses(); // Refresh the pending list
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
                await refreshPendingExpenses(); // Refresh the pending list
            } catch (error) {
                console.error('Error rejecting expense:', error);
                alert('Error rejecting expense. Please try again.');
            }
        }
    };

    if (dismissed) {
        return null;
    }

    if (loading.pendingExpenses) {
        return (
            <div className="bg-white p-4 shadow rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Pending Expenses</h2>
                <div className="text-center py-4">Loading pending expenses...</div>
            </div>
        );
    }

    if (pendingExpenses.length === 0) {
        return null; // Don't show the component if there are no pending expenses
    }

    return (
        <div className="bg-white p-4 shadow rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-orange-600">
                    Pending Expenses ({pendingExpenses.length})
                </h2>
                <button 
                    onClick={() => setDismissed(true)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
            
            <div className="space-y-3">
                {pendingExpenses.map(expense => (
                    <div key={`pending-expense-${expense.id}`} className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{expense.description}</div>
                                <div className="text-sm text-gray-600">
                                    Amount: ₹{expense.amount.toFixed(2)} | 
                                    Date: {new Date(expense.date).toLocaleDateString()} | 
                                    Added by: {expense.addedBy?.fullName || 'Unknown'}
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => handleApproveExpense(expense.id)}
                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleRejectExpense(expense.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
