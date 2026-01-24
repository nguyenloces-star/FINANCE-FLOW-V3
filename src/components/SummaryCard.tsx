import React from 'react';
import { ArrowDown, ArrowUp, DollarSign, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance' | 'safe';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type }) => {
  let colorClass = 'text-gray-900 dark:text-gray-100';
  let bgClass = 'bg-white dark:bg-slate-800';
  let Icon = DollarSign;

  if (type === 'income') {
    colorClass = 'text-emerald-600 dark:text-emerald-400';
    bgClass = 'bg-emerald-50 dark:bg-emerald-900/30';
    Icon = ArrowUp;
  } else if (type === 'expense') {
    colorClass = 'text-rose-600 dark:text-rose-400';
    bgClass = 'bg-rose-50 dark:bg-rose-900/30';
    Icon = ArrowDown;
  } else if (type === 'safe') {
    // Safe to spend logic: Red if negative, Emerald if positive
    colorClass = amount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
    bgClass = 'bg-emerald-50 dark:bg-emerald-900/30';
    Icon = ShieldCheck;
  } else {
    colorClass = amount >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400';
    bgClass = 'bg-blue-50 dark:bg-blue-900/30';
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${colorClass}`}>{formatCurrency(amount)}</h3>
      </div>
      <div className={`p-3 rounded-full ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  );
};