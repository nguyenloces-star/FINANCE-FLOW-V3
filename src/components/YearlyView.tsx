import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, getMonthName } from '../utils';
import { getCategoryById } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface YearlyViewProps {
  transactions: Transaction[];
  year: number;
  onYearChange: (year: number) => void;
}

export const YearlyView: React.FC<YearlyViewProps> = ({ transactions, year, onYearChange }) => {
  // Chart Data Preparation
  const chartData = useMemo(() => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: getMonthName(i), // Returns Jan, Feb, etc.
      income: 0,
      expense: 0,
      balance: 0,
    }));

    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === year) {
        const monthIndex = tDate.getMonth();
        if (t.type === TransactionType.INCOME) {
          monthlyData[monthIndex].income += t.amount;
        } else {
          monthlyData[monthIndex].expense += t.amount;
        }
      }
    });

    const calculatedData = monthlyData.map(m => ({
        ...m,
        balance: m.income - m.expense
    }));

    // CẬP NHẬT: Trả về đủ 12 tháng (Bỏ slice(-5))
    return calculatedData;
  }, [transactions, year]);

  const totals = useMemo(() => {
     const fullYearData = Array.from({ length: 12 }, (_, i) => ({ income: 0, expense: 0 }));
     transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate.getFullYear() === year) {
        const monthIndex = tDate.getMonth();
        if (t.type === TransactionType.INCOME) {
          fullYearData[monthIndex].income += t.amount;
        } else {
          fullYearData[monthIndex].expense += t.amount;
        }
      }
    });

    return fullYearData.reduce<{ income: number; expense: number; balance: number }>(
      (acc, curr) => ({
        income: acc.income + curr.income,
        expense: acc.expense + curr.expense,
        balance: acc.balance + (curr.income - curr.expense),
      }),
      { income: 0, expense: 0, balance: 0 }
    );
  }, [transactions, year]);

  // Matrix Data Preparation
  const expenseCategories = useMemo(() => {
    const categoryIds = new Set<string>();
    transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === year && t.type === TransactionType.EXPENSE) {
            categoryIds.add(t.category);
        }
    });
    return Array.from(categoryIds).map(id => getCategoryById(id));
  }, [transactions, year]);

  const matrixData = useMemo(() => {
      const months = Array.from({length: 12}, (_, i) => ({
          monthIndex: i,
          monthName: getMonthName(i),
          categories: {} as Record<string, number>,
          total: 0
      }));
      
      transactions.forEach(t => {
          const d = new Date(t.date);
          if (d.getFullYear() === year && t.type === TransactionType.EXPENSE) {
              const m = d.getMonth();
              months[m].categories[t.category] = (months[m].categories[t.category] || 0) + t.amount;
              months[m].total += t.amount;
          }
      });
      return months;
  }, [transactions, year]);

  const categoryTotals = useMemo(() => {
    const cats: Record<string, number> = {};
    matrixData.forEach(row => {
        Object.entries(row.categories).forEach(([catId, amount]) => {
            cats[catId] = (cats[catId] || 0) + (amount as number);
        });
    });
    return cats;
  }, [matrixData]);

  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <button
          onClick={() => onYearChange(year - 1)}
          className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-bold text-slate-800 dark:text-white capitalize">{year}</span>
        <button
          onClick={() => onYearChange((year as number) + 1)}
          className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-all active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center">
                <div className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Yearly Overview</h3>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Income
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span> Expense
                </div>
            </div>
          </div>
          
           <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis 
                    width={45} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(val) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(val)} 
                />
                <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="income" name="Income" fill="#059669" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Expense" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col justify-center gap-6">
            <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">Total Income</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.income)}</p>
            </div>
             <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
             <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">Total Expenses</p>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totals.expense)}</p>
            </div>
             <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
             <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">Net Savings</p>
                <p className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>{formatCurrency(totals.balance)}</p>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Category Breakdown</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[600px] text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-slate-50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-600 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 sticky left-0 z-10 bg-slate-50 dark:bg-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Month</th>
                {expenseCategories.map(cat => (
                    <th key={cat.id} className="p-4 text-right min-w-[120px]">{cat.name}</th>
                ))}
                <th className="p-4 text-right font-bold bg-slate-100 dark:bg-slate-800">Total</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {matrixData.map((row) => (
                <tr key={row.monthIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-slate-800 dark:text-white sticky left-0 z-10 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-slate-50">
                        {row.monthName}
                    </td>
                    {expenseCategories.map(cat => (
                        <td key={cat.id} className="p-4 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                            {row.categories[cat.id] ? formatCurrency(row.categories[cat.id]) : '-'}
                        </td>
                    ))}
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700">
                        {formatCurrency(row.total)}
                    </td>
                </tr>
                ))}
                <tr className="bg-slate-100 dark:bg-slate-700 font-bold">
                    <td className="p-4 sticky left-0 z-10 bg-slate-100 dark:bg-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-slate-800 dark:text-white">Grand Total</td>
                    {expenseCategories.map(cat => (
                        <td key={cat.id} className="p-4 text-right text-rose-600 dark:text-rose-400">
                            {categoryTotals[cat.id] ? formatCurrency(categoryTotals[cat.id]) : '-'}
                        </td>
                    ))}
                    <td className="p-4 text-right text-slate-900 dark:text-white">
                        {formatCurrency(totals.expense)}
                    </td>
                </tr>
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};