'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api';
import { Bill, Expense, Patient } from '@/types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
    subDays, 
    startOfWeek, 
    endOfWeek, 
    startOfMonth, 
    endOfMonth,
    startOfYear,
    endOfYear,
    startOfDay,
    endOfDay
} from 'date-fns';
import jsPDF from 'jspdf';

type Transaction = (Bill | Expense) & { type: 'revenue' | 'expense' };

export default function FinancialDashboard() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [dateFilter, setDateFilter] = useState('today');
    const [startDate, setStartDate] = useState<Date | null>(startOfDay(new Date()));
    const [endDate, setEndDate] = useState<Date | null>(endOfDay(new Date()));
    const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'revenue', 'expense'
    const [methodFilter, setMethodFilter] = useState('all'); // 'all', 'cash', 'online'

    useEffect(() => {
        let mounted = true;
        Promise.all([ApiService.getAnalyticsSummary(), ApiService.getPatients()])
            .then(([summary, patientsResp]) => {
                if (!mounted) return;
                const tx = (summary.transactions || []) as any[];
                const normalizedBills = tx.filter(t => t.type === 'revenue').map(b => ({
                    ...b,
                    issuedAt: b.issuedAt ? new Date(b.issuedAt) : new Date(),
                    paymentDetails: b.paymentMethod ? { paymentMethod: b.paymentMethod, paymentDate: b.paymentDate ? new Date(b.paymentDate) : undefined } : undefined,
                    createdBy: b.createdBy && b.createdBy.username ? b.createdBy.username : (b.createdBy || 'system'),
                    patientId: b.patient ? b.patient.id : '',
                    amount: b.amount || 0,
                }));
                const normalizedExpenses = tx.filter(t => t.type === 'expense').map(e => ({
                    ...e,
                    date: e.date ? new Date(e.date) : new Date(),
                    method: e.method || '',
                    createdBy: e.addedBy && e.addedBy.fullName ? e.addedBy.fullName : (e.addedBy?.username || 'system'),
                    amount: e.amount || 0,
                }));
                setBills(normalizedBills as any);
                setExpenses(normalizedExpenses as any);
                setPatients(patientsResp as any);
            })
            .catch(() => {})
        return () => { mounted = false; };
    }, []);

    const getPatientName = (patientId: any) => {
        const patient = patients.find(p => String(p.id) === String(patientId));
        return patient ? patient.fullName : 'Unknown Patient';
    };

    const handleDateFilterChange = (filterType: string) => {
        const today = new Date();
        setDateFilter(filterType);
        switch (filterType) {
            case 'today':
                setStartDate(startOfDay(today));
                setEndDate(endOfDay(today));
                break;
            case 'yesterday':
                const yesterday = subDays(today, 1);
                setStartDate(startOfDay(yesterday));
                setEndDate(endOfDay(yesterday));
                break;
            case 'this_week':
                setStartDate(startOfWeek(today));
                setEndDate(endOfWeek(today));
                break;
            case 'this_month':
                setStartDate(startOfMonth(today));
                setEndDate(endOfMonth(today));
                break;
            case 'this_year':
                setStartDate(startOfYear(today));
                setEndDate(endOfYear(today));
                break;
            case 'all_time':
                setStartDate(null);
                setEndDate(null);
                break;
            case 'single_day':
            case 'date_range':
                setStartDate(null);
                setEndDate(null);
                break;
        }
    };
    
    const handleDateChange = (dates: [Date | null, Date | null] | Date | null) => {
        if (dateFilter === 'single_day' && dates instanceof Date) {
            setStartDate(startOfDay(dates));
            setEndDate(endOfDay(dates));
        } else if (Array.isArray(dates)) {
            const [start, end] = dates;
            setStartDate(start ? startOfDay(start) : null);
            setEndDate(end ? endOfDay(end) : null);
        }
    };

    const generateReport = async () => {
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF();
        const clinicProfile = { name: 'The Dental Experts' } as any;

        // Sort transactions for running balance
        const sortedTransactions = [...filteredTransactions].sort((a, b) => (a.issuedAt || a.date).getTime() - (b.issuedAt || b.date).getTime());

        // Determine date range for header
        const firstTxDate = sortedTransactions.length > 0 ? (sortedTransactions[0].issuedAt || sortedTransactions[0].date) : null;
        const lastTxDate = sortedTransactions.length > 0 ? (sortedTransactions[sortedTransactions.length - 1].issuedAt || sortedTransactions[sortedTransactions.length - 1].date) : null;
        
        const reportStartDate = startDate || firstTxDate;
        const reportEndDate = endDate || lastTxDate;

        const dateDisplayFormat = { month: 'long', day: 'numeric', year: 'numeric' };
        const startDateStr = reportStartDate ? reportStartDate.toLocaleDateString('en-US', dateDisplayFormat) : 'Beginning of Records';
        const endDateStr = reportEndDate ? reportEndDate.toLocaleDateString('en-US', dateDisplayFormat) : 'Current';

        // 1. Clinic Name
        doc.setFontSize(22);
        doc.text(clinicProfile.name, 14, 20);

        // 2. Report Title (Date Range)
        doc.setFontSize(18);
        doc.text(`${startDateStr} to ${endDateStr}`, 14, 30);

        // 3. Generated On Box
        doc.setFontSize(12);
        doc.rect(14, 36, 182, 10);
        doc.text(`Report Generated On: ${new Date().toLocaleDateString()}`, 16, 42);

        // 4. Summary Boxes
        doc.rect(14, 50, 182, 20);
        doc.line(74, 50, 74, 70); // Vertical line 1
        doc.line(134, 50, 134, 70); // Vertical line 2
        
        doc.setTextColor(108, 117, 125); // Gray for labels
        doc.text("Total Revenue", 32, 56);
        doc.text("Total Expenses", 88, 56);
        doc.text("Net Balance", 150, 56);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 167, 69); // Green for revenue
        doc.text(`${totalRevenue.toFixed(2)}`, 38, 64);
        
        doc.setTextColor(220, 53, 69); // Red for expenses
        doc.text(`${totalExpenses.toFixed(2)}`, 98, 64);
        
        // Net Balance
        const netBalanceColor = netProfit >= 0 ? [40, 167, 69] : [220, 53, 69]; // Green or Red
        doc.setTextColor(netBalanceColor[0], netBalanceColor[1], netBalanceColor[2]);
        doc.text(`${netProfit.toFixed(2)}`, 153, 64);
        doc.setFont('helvetica', 'normal');

        // 5. Total Entries
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.text(`Total No. of entries: ${sortedTransactions.length}`, 14, 80);

        // 6. Table
        let runningBalance = 0;
        const tableBody = sortedTransactions.map(tx => {
            const isRevenue = tx.type === 'revenue';
            runningBalance += isRevenue ? tx.amount : -tx.amount;
            return [
                (tx.issuedAt || tx.date).toLocaleDateString(),
                tx.createdBy,
                isRevenue ? getPatientName(tx.patientId) : tx.description,
                isRevenue ? tx.paymentDetails?.paymentMethod : tx.method,
                isRevenue ? tx.amount.toFixed(2) : '',
                !isRevenue ? tx.amount.toFixed(2) : '',
                runningBalance.toFixed(2)
            ];
        });

        autoTable(doc, {
            startY: 86,
            head: [['Date', 'Entry by', 'Party', 'Mode', 'Revenue', 'Expense', 'Balance']],
            body: tableBody,
            didParseCell: (data) => {
                if (data.section === 'body') {
                    if (data.column.index === 4 && data.cell.text[0]) { // Revenue
                        data.cell.styles.textColor = [40, 167, 69];
                    }
                    if (data.column.index === 5 && data.cell.text[0]) { // Expense
                        data.cell.styles.textColor = [220, 53, 69];
                    }
                    if (data.column.index === 6) { // Balance
                        const balanceValue = parseFloat(data.cell.text[0]);
                        if (balanceValue >= 0) {
                            data.cell.styles.textColor = [40, 167, 69]; // Green
                        } else {
                            data.cell.styles.textColor = [220, 53, 69]; // Red
                        }
                    }
                }
            }
        });

        doc.save('transactions-report.pdf');
    };

    const filteredTransactions: Transaction[] = [...bills.map(b => ({ ...b, type: 'revenue' as 'revenue' })), ...expenses.map(e => ({ ...e, type: 'expense' as 'expense' }))]
        .filter(tx => {
            // Date Filter
            if (startDate && endDate) {
                const txDate = tx.type === 'revenue' ? tx.issuedAt : tx.date;
                if (txDate < startDate || txDate > endDate) return false;
            }

            // Type Filter
            if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

            // Method Filter
            if (methodFilter !== 'all') {
                if (tx.type === 'revenue') {
                    const pm = (tx as any).paymentDetails?.paymentMethod || (tx as any).paymentMethod;
                    if (pm !== methodFilter) return false;
                }
                if (tx.type === 'expense' && (tx as any).method !== methodFilter) return false;
            }
            
            return true;
        });

    const totalRevenue = filteredTransactions.filter(tx => tx.type === 'revenue').reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = filteredTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const sortedTransactions = [...filteredTransactions].sort((a, b) => (a.issuedAt || a.date).getTime() - (b.issuedAt || b.date).getTime());

    const tableData = sortedTransactions.reduce((acc, tx) => {
        const isRevenue = tx.type === 'revenue';
        const prevBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
        const newBalance = isRevenue ? prevBalance + tx.amount : prevBalance - tx.amount;
        acc.push({ ...tx, balance: newBalance });
        return acc;
    }, [] as (Transaction & { balance: number })[]);

  return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Financial Analytics</h1>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center space-x-2">
                    <label htmlFor="dateFilter" className="font-semibold">Date:</label>
                    <select id="dateFilter" value={dateFilter} onChange={(e) => handleDateFilterChange(e.target.value)} className="p-2 border rounded-md text-sm">
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this_week">This Week</option>
                        <option value="this_month">This Month</option>
                        <option value="this_year">This Year</option>
                        <option value="all_time">All Time</option>
                        <option value="single_day">Single Day</option>
                        <option value="date_range">Date Range</option>
                    </select>
                </div>
                {dateFilter === 'single_day' && (
                    <DatePicker selected={startDate} onChange={handleDateChange} className="p-2 border rounded-md text-sm" placeholderText="Select a day" />
                )}
                {dateFilter === 'date_range' && (
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={handleDateChange}
                        isClearable={true}
                        className="p-2 border rounded-md text-sm"
                        placeholderText="Select a date range"
                    />
                )}
                 <div className="flex items-center space-x-2">
                    <label htmlFor="typeFilter" className="font-semibold">Show:</label>
                    <select id="typeFilter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="p-2 border rounded-md text-sm">
                        <option value="all">All Transactions</option>
                        <option value="revenue">Revenue</option>
                        <option value="expense">Expenses</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="methodFilter" className="font-semibold">Method:</label>
                    <select id="methodFilter" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="p-2 border rounded-md text-sm">
                        <option value="all">All Methods</option>
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                    </select>
                </div>
                <button 
                    onClick={generateReport}
                    className="p-2 border rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600"
                >
                    Generate Report
                </button>
                <a
                    href={`http://localhost:8080/api/analytics/report.csv${startDate && endDate ? `?start=${startDate.toISOString().slice(0,10)}&end=${endDate.toISOString().slice(0,10)}` : ''}`}
                    className="p-2 border rounded-md text-sm bg-green-500 text-white hover:bg-green-600"
                >
                    Download CSV
                </a>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-lg font-semibold text-gray-600">Total Revenue</h2>
                    <p className="text-4xl font-bold text-green-500 mt-2">{`₹${totalRevenue.toFixed(2)}`}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-lg font-semibold text-gray-600">Total Expenses</h2>
                    <p className="text-4xl font-bold text-red-500 mt-2">{`₹${totalExpenses.toFixed(2)}`}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-lg font-semibold text-gray-600">Net Balance</h2>
                    <p className={`text-4xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{`₹${netProfit.toFixed(2)}`}</p>
                </div>
            </div>
            
            {/* Transaction Log */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-3 font-semibold">Date</th>
                                <th className="p-3 font-semibold">Entry by</th>
                                <th className="p-3 font-semibold">Party</th>
                                <th className="p-3 font-semibold">Mode</th>
                                <th className="p-3 font-semibold text-right">Revenue</th>
                                <th className="p-3 font-semibold text-right">Expense</th>
                                <th className="p-3 font-semibold text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((tx, idx) => {
                                const isRevenue = tx.type === 'revenue';
                                return (
                                    <tr key={`${tx.type}-${(tx as any).id || (tx.issuedAt || tx.date)?.getTime() || idx}`} className="border-b">
                                        <td className="p-3">{(tx.issuedAt || tx.date).toLocaleDateString()}</td>
                                        <td className="p-3">{(tx as any).createdBy}</td>
                                        <td className="p-3">{isRevenue ? getPatientName((tx as any).patientId) : (tx as any).description}</td>
                                        <td className="p-3 capitalize">{isRevenue ? ((tx as any).paymentDetails?.paymentMethod || (tx as any).paymentMethod || '') : (tx as any).method}</td>
                                        <td className="p-3 text-right font-semibold text-green-500">
                                            {isRevenue ? tx.amount.toFixed(2) : null}
                                        </td>
                                        <td className="p-3 text-right font-semibold text-red-500">
                                            {!isRevenue ? tx.amount.toFixed(2) : null}
                                        </td>
                                        <td className={`p-3 text-right font-semibold ${tx.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.balance.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
