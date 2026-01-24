import React, { useMemo, useState } from 'react';
import { Edit2, Trash2, Search, Filter, Download, Wallet, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, TransactionType, MonthlySummary } from '../types';
import { formatCurrency, formatDate, exportToExcel } from '../utils';
import { AnalyticsCharts } from './AnalyticsCharts';
import { getCategoryById, CATEGORY_ITEMS } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  currentDate,
  onDateChange,
  onEdit,
  onDelete,
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // 1. Current Month Data
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        const matchesMonth = tDate.getMonth() === currentDate.getMonth() &&
                             tDate.getFullYear() === currentDate.getFullYear();
        
        const matchesSearch = t.note.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.amount.toString().includes(searchTerm);
        
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

        return matchesMonth && matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentDate, searchTerm, categoryFilter]);

  // 2. Previous Month Data (For Badges)
  const prevMonthSummary = useMemo(() => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(currentDate.getMonth() - 1);
    
    const prevTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === prevDate.getMonth() && d.getFullYear() === prevDate.getFullYear();
    });

    return prevTx.reduce((acc, curr) => {
        if (curr.type === TransactionType.INCOME) {
            acc.income += curr.amount;
            acc.balance += curr.amount;
        } else {
            acc.expense += curr.amount;
            acc.balance -= curr.amount;
        }
        return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [transactions, currentDate]);

  const recentIncome = useMemo(() => filteredTransactions.filter(t => t.type === TransactionType.INCOME), [filteredTransactions]);
  const recentExpenses = useMemo(() => filteredTransactions.filter(t => t.type === TransactionType.EXPENSE), [filteredTransactions]);

  // 3. Calculate Summary
  const summary: MonthlySummary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, curr) => {
        if (curr.type === TransactionType.INCOME) {
          acc.income += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.expense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [filteredTransactions]);

  const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
  };

  const incomeGrowth = calculateGrowth(summary.income, prevMonthSummary.income);
  const expenseGrowth = calculateGrowth(summary.expense, prevMonthSummary.expense);
  const balanceGrowth = calculateGrowth(summary.balance, prevMonthSummary.balance);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleExport = () => {
      exportToExcel(filteredTransactions, `Transactions_${formatDate(currentDate.toISOString()).replace(/\//g, '-')}.xlsx`);
  };

  const renderTransactionItem = (t: Transaction) => {
    const category = getCategoryById(t.category);
    const Icon = category.icon;
    const isIncome = t.type === TransactionType.INCOME;
    
    return (
        <div
          key={t.id}
          className="group flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
        >
          {/* Left Side: Icon + Text (Truncated) */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center ${
                isIncome ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100/80 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm md:text-base font-bold text-slate-800 dark:text-white truncate">{category.name}</p>
              <div className="flex items-center gap-2 truncate">
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{formatDate(t.date)}</p>
                 {t.isRecurring && (
                     <span className="flex-shrink-0 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold dark:bg-blue-900/40 dark:text-blue-300">Recurring</span>
                 )}
              </div>
            </div>
          </div>

          {/* Right Side: Amount + Actions */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            <div className="text-right">
              <p
                className={`font-bold text-sm md:text-lg whitespace-nowrap ${
                  isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(t.amount)}
              </p>
              {t.note && <p className="text-xs text-slate-400 max-w-[80px] md:max-w-[100px] truncate">{t.note}</p>}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
              <button
                onClick={() => onEdit(t)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
             {/* Mobile Edit Trigger */}
             <button onClick={() => onEdit(t)} className="md:hidden text-slate-400">
                <Edit2 className="w-4 h-4" />
             </button>
          </div>
        </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Shared Design System: Navigator Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
          {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-all active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Summary Cards Grid (Updated Responsive Layout & Aesthetics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Card 1: Total Balance */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-emerald-900/20 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between min-h-[160px]">
            {/* Watermark Icon */}
            <Wallet className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-100 dark:text-emerald-900/20 opacity-50 -z-10 rotate-12" />
            
            <div>
                <p className="text-lg font-bold text-slate-800 dark:text-white z-10">Current Balance</p>
                <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-4 tracking-tight z-10">
                    {formatCurrency(summary.balance)}
                </h3>
            </div>
            <div className="mt-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    balanceGrowth >= 0 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                }`}>
                    {balanceGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(balanceGrowth).toFixed(1)}% vs last month
                </span>
            </div>
        </div>

        {/* Card 2: Income */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/20 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between min-h-[160px]">
            {/* Watermark Icon */}
            <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-100 dark:text-blue-900/20 opacity-50 -z-10 rotate-12" />

            <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">Total Income</p>
                    <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-4">
                        {formatCurrency(summary.income)}
                    </h3>
                </div>
            </div>
            <div className="mt-4 z-10">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {Math.abs(incomeGrowth).toFixed(1)}% vs last month
                </span>
            </div>
        </div>

        {/* Card 3: Expense */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-rose-50 dark:from-slate-800 dark:to-rose-900/20 p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between min-h-[160px]">
             {/* Watermark Icon */}
             <TrendingDown className="absolute -bottom-4 -right-4 w-32 h-32 text-rose-100 dark:text-rose-900/20 opacity-50 -z-10 rotate-12" />

             <div className="flex justify-between items-start z-10">
                <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white">Total Expenses</p>
                    <h3 className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-4">
                        {formatCurrency(summary.expense)}
                    </h3>
                </div>
            </div>
            <div className="mt-4 z-10">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {Math.abs(expenseGrowth).toFixed(1)}% vs last month
                </span>
            </div>
        </div>

      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 bg-white dark:bg-slate-800 p-3 md:p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50">
         <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
             />
         </div>
         <div className="flex gap-2 md:gap-3">
             <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 md:py-3 rounded-xl text-sm font-bold border transition-all active:scale-95 ${showFilters ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
                 <Filter className="w-4 h-4" /> Filter
             </button>
             <button 
                onClick={handleExport}
                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 md:py-3 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
             >
                 <Download className="w-4 h-4" /> Export
             </button>
         </div>
      </div>
      
      {/* Expanded Filters */}
      {showFilters && (
          <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Filter by Category</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full md:w-1/3 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-emerald-600"
              >
                  <option value="all">All Categories</option>
                  {CATEGORY_ITEMS.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
          </div>
      )}

      {/* Analytics Section (Charts) */}
      <AnalyticsCharts transactions={filteredTransactions} currentDate={currentDate} />

      {/* Split Recent Transactions Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Income List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex flex-col h-[400px] md:h-[550px] overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-1 h-5 md:h-6 bg-emerald-600 rounded-full mr-2 md:mr-3"></div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Income</h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">{recentIncome.length}</span>
              </div>
              <div className="flex-1 overflow-auto p-4 md:p-5 custom-scrollbar">
                {recentIncome.length > 0 ? (
                    <div className="space-y-3">
                        {recentIncome.map(renderTransactionItem)}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                        <Wallet className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mb-3" />
                        <p className="text-slate-400 text-sm font-medium">No income records yet</p>
                    </div>
                )}
              </div>
          </div>

          {/* Expense List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex flex-col h-[400px] md:h-[550px] overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-1 h-5 md:h-6 bg-rose-500 rounded-full mr-2 md:mr-3"></div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Expenses</h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg">{recentExpenses.length}</span>
              </div>
              <div className="flex-1 overflow-auto p-4 md:p-5 custom-scrollbar">
                {recentExpenses.length > 0 ? (
                    <div className="space-y-3">
                        {recentExpenses.map(renderTransactionItem)}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                        <Wallet className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mb-3" />
                        <p className="text-slate-400 text-sm font-medium">No expense records yet</p>
                    </div>
                )}
              </div>
          </div>
      </div>
    </div>
  );
};