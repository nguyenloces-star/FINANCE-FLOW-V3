import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { formatCurrency } from '../utils';

interface StatCardProps {
  title: string;
  amount: number;
  growth?: number;
  growthText?: string;
  type: 'balance' | 'income' | 'expense';
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ title, amount, growth, growthText, type, icon: Icon }) => {
  let bgGradient = '';
  let iconColor = '';
  let amountColor = '';
  let badgeColor = '';
  let TrendIcon = TrendingUp;

  // 1. TÔNG MÀU XANH LỤC (INCOME)
  if (type === 'income') {
    bgGradient = 'from-white to-emerald-50 dark:from-slate-800 dark:to-emerald-900/20';
    iconColor = 'text-emerald-100 dark:text-emerald-900/20';
    amountColor = 'text-emerald-600 dark:text-emerald-400 drop-shadow-sm';
    badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    TrendIcon = TrendingUp;
  } 
  // 2. TÔNG MÀU CAM (EXPENSE)
  else if (type === 'expense') {
    bgGradient = 'from-white to-orange-50 dark:from-slate-800 dark:to-orange-900/20';
    iconColor = 'text-orange-100 dark:text-orange-900/20';
    amountColor = 'text-orange-500 dark:text-orange-400 drop-shadow-sm';
    badgeColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    TrendIcon = TrendingDown;
  } 
  // 3. TÔNG MÀU XANH DƯƠNG / ĐỎ (BALANCE)
  else {
    const isPositive = amount >= 0;
    
    // Nền card
    bgGradient = isPositive 
        ? 'from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/20'
        : 'from-white to-rose-50 dark:from-slate-800 dark:to-rose-900/20';
    
    // Màu Icon chìm
    iconColor = isPositive 
        ? 'text-blue-100 dark:text-blue-900/20'
        : 'text-rose-100 dark:text-rose-900/20';
        
    // Màu Text Số Tiền
    amountColor = isPositive 
        ? 'text-blue-600 dark:text-blue-400 drop-shadow-sm'
        : 'text-rose-600 dark:text-rose-400 drop-shadow-sm';
    
    // Màu Badge % Tăng trưởng
    if (growth !== undefined) {
      badgeColor = growth >= 0 
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      TrendIcon = growth >= 0 ? TrendingUp : TrendingDown;
    }
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between min-h-[160px] transition-all hover:shadow-md`}>
      <Icon className={`absolute -bottom-4 -right-4 w-32 h-32 ${iconColor} opacity-50 -z-10 rotate-12`} />
      
      <div className="flex justify-between items-start z-10">
        <div>
            <p className="text-lg font-bold text-slate-800 dark:text-white">{title}</p>
            <h3 className={`text-3xl font-black ${amountColor} mt-4 tracking-tight`}>
                {formatCurrency(amount)}
            </h3>
        </div>
      </div>
      
      {growth !== undefined && growthText && (
        <div className="mt-4 z-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${badgeColor}`}>
                <TrendIcon className="w-3.5 h-3.5" />
                {Math.abs(growth).toFixed(1)}% {growthText}
            </span>
        </div>
      )}
    </div>
  );
};