import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';
import { CATEGORY_ITEMS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoryGridProps {
  transactions: Transaction[];
  currentDate: Date;
  periodType: 'month' | 'year';
  type: TransactionType;
  title: string;
  themeColor: string;
  bgTheme: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ transactions, currentDate, periodType, type, title, themeColor, bgTheme }) => {
  const { t } = useLanguage();
  const isYearly = periodType === 'year';

  const isTransactionInPeriod = (dateString: string) => {
    const d = new Date(dateString);
    if (isYearly) return d.getFullYear() === currentDate.getFullYear();
    return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
  };

  const gridData = useMemo(() => {
    const allCategories = CATEGORY_ITEMS.filter(c => c.type === type);
    const categoryTotals = allCategories.map(cat => {
        const sum = transactions
            .filter(tx => isTransactionInPeriod(tx.date) && tx.category === cat.id)
            .reduce((acc, curr) => acc + curr.amount, 0);
        return { ...cat, sum };
    }).sort((a, b) => b.sum - a.sum);

    const grandTotal = categoryTotals.reduce((a, b) => a + b.sum, 0);
    return { categoryTotals, grandTotal };
  }, [transactions, currentDate, periodType, type]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
            <span className={`text-lg font-black ${themeColor}`}>{formatCurrency(gridData.grandTotal)}</span>
        </div>
        <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {gridData.categoryTotals.map(cat => {
                    const Icon = cat.icon;
                    const percent = gridData.grandTotal > 0 ? ((cat.sum / gridData.grandTotal) * 100).toFixed(1) : 0;
                    const hasData = cat.sum > 0;

                    return (
                        <div key={cat.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${hasData ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-70'}`}>
                            <div className={`p-3 rounded-full ${hasData ? bgTheme : 'bg-slate-100 dark:bg-slate-800 text-slate-400'} ${hasData ? themeColor : ''}`}>
                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-[11px] md:text-xs font-bold text-slate-600 dark:text-slate-300 text-center line-clamp-1 w-full" title={t(`cat_${cat.id}`)}>
                                {t(`cat_${cat.id}`)}
                            </p>
                            <p className={`text-xs md:text-sm font-black ${hasData ? themeColor : 'text-slate-400 dark:text-slate-500'}`}>
                                {formatCurrency(cat.sum)}
                            </p>
                            {hasData && <p className="text-[10px] font-bold text-slate-400">{percent}%</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};