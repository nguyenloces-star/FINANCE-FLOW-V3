import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';
import { getCategoryById } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface PeriodStatsProps {
  transactions: Transaction[];
  periodType: 'month' | 'year';
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const PeriodStats: React.FC<PeriodStatsProps> = ({ transactions, periodType, currentDate, onDateChange }) => {
  const { t, language } = useLanguage();
  const isYearly = periodType === 'year';

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (isYearly) newDate.setFullYear(newDate.getFullYear() - 1);
    else newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (isYearly) newDate.setFullYear(newDate.getFullYear() + 1);
    else newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const displayTitle = isYearly 
    ? currentDate.getFullYear().toString()
    : currentDate.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const columnsCount = isYearly ? 12 : daysInMonth;

  const getColumnName = (index: number) => isYearly ? t('months').split(',')[index] : `${index + 1}`;
  
  const getColumnIndex = (dateString: string) => {
    const d = new Date(dateString);
    return isYearly ? d.getMonth() : d.getDate() - 1;
  };

  const isTransactionInPeriod = (dateString: string) => {
    const d = new Date(dateString);
    if (isYearly) return d.getFullYear() === currentDate.getFullYear();
    return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
  };

  const chartData = useMemo(() => {
    const data = Array.from({ length: columnsCount }, (_, i) => ({ name: getColumnName(i), income: 0, expense: 0, balance: 0 }));
    transactions.forEach((tx) => {
      if (isTransactionInPeriod(tx.date)) {
        const idx = getColumnIndex(tx.date);
        if (tx.type === TransactionType.INCOME) data[idx].income += tx.amount;
        else data[idx].expense += tx.amount;
      }
    });
    return data.map(m => ({ ...m, balance: m.income - m.expense }));
  }, [transactions, currentDate, periodType, t]);

  const totals = useMemo(() => {
    return chartData.reduce((acc, curr) => ({
        income: acc.income + curr.income, expense: acc.expense + curr.expense, balance: acc.balance + curr.balance
    }), { income: 0, expense: 0, balance: 0 });
  }, [chartData]);

  const generateMatrix = (type: TransactionType) => {
    const categoryIds = new Set<string>();
    transactions.forEach(tx => { 
        if (isTransactionInPeriod(tx.date) && tx.type === type) categoryIds.add(tx.category); 
    });
    const activeCategories = Array.from(categoryIds).map(id => getCategoryById(id));

    const matrix = Array.from({ length: columnsCount }, (_, i) => ({
        colIndex: i, colName: getColumnName(i), categories: {} as Record<string, number>, total: 0
    }));

    transactions.forEach(tx => {
        if (isTransactionInPeriod(tx.date) && tx.type === type) {
            const idx = getColumnIndex(tx.date);
            matrix[idx].categories[tx.category] = (matrix[idx].categories[tx.category] || 0) + tx.amount;
            matrix[idx].total += tx.amount;
        }
    });

    const categoryTotals: Record<string, number> = {};
    matrix.forEach(row => {
        Object.entries(row.categories).forEach(([catId, amount]) => {
            categoryTotals[catId] = (categoryTotals[catId] || 0) + (amount as number);
        });
    });

    return { categories: activeCategories, matrix, categoryTotals };
  };

  const incomeMatrix = useMemo(() => generateMatrix(TransactionType.INCOME), [transactions, currentDate, periodType, t]);
  const expenseMatrix = useMemo(() => generateMatrix(TransactionType.EXPENSE), [transactions, currentDate, periodType, t]);

  // UX ĐÃ FIX: Cho phép cuộn ngang (overflow-x-auto) và Ghim cột (sticky left-0)
  const MatrixTable = ({ title, dataObj, grandTotal, themeColor }: any) => {
    if (dataObj.categories.length === 0) return null; 

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
            </div>
            <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[600px] text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-600 text-slate-500 uppercase tracking-wider">
                    <th className="p-3 sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/90 w-[15%] md:w-[12%] text-[10px] md:text-xs font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        {isYearly ? t('month') : t('date')}
                    </th>
                    {dataObj.categories.map((cat: any) => {
                        const Icon = cat.icon;
                        return (
                            <th key={cat.id} className="p-2 text-center min-w-[80px]" title={t(`cat_${cat.id}`)}>
                                <div className="flex flex-col items-center justify-end h-full gap-1">
                                    <Icon className="w-4 h-4 opacity-60 mb-0.5" />
                                    <span className="w-full block text-[10px] md:text-xs leading-tight font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {t(`cat_${cat.id}`)}
                                    </span>
                                </div>
                            </th>
                        );
                    })}
                    <th className="p-3 text-right w-[15%] text-[10px] md:text-xs font-bold whitespace-nowrap bg-slate-50 dark:bg-slate-800/50">{t('grandTotal')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {dataObj.matrix.map((row: any) => {
                        if (row.total === 0) return null; 
                        return (
                            <tr key={row.colIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                <td className="p-3 text-[11px] md:text-sm font-semibold text-slate-600 dark:text-slate-300 sticky left-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap">
                                    {row.colName}
                                </td>
                                {dataObj.categories.map((cat: any) => (
                                    <td key={cat.id} className="p-2 text-center text-[11px] md:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                        {row.categories[cat.id] ? formatCurrency(row.categories[cat.id]) : '-'}
                                    </td>
                                ))}
                                <td className="p-3 text-right text-[11px] md:text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                    {formatCurrency(row.total)}
                                </td>
                            </tr>
                        );
                    })}
                    <tr className="bg-slate-50 dark:bg-slate-700/30">
                        <td className="p-3 text-[11px] md:text-sm font-bold text-slate-800 dark:text-white sticky left-0 z-10 bg-slate-50 dark:bg-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap">
                            {t('grandTotal')}
                        </td>
                        {dataObj.categories.map((cat: any) => (
                            <td key={cat.id} className={`p-2 text-center text-[11px] md:text-sm font-bold whitespace-nowrap ${themeColor}`}>
                                {dataObj.categoryTotals[cat.id] ? formatCurrency(dataObj.categoryTotals[cat.id]) : '-'}
                            </td>
                        ))}
                        <td className="p-3 text-right text-xs md:text-base font-black whitespace-nowrap">
                            {formatCurrency(grandTotal)}
                        </td>
                    </tr>
                </tbody>
                </table>
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <button onClick={handlePrev} className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition-all active:scale-95"><ChevronLeft className="w-6 h-6" /></button>
        <span className="text-xl font-bold text-slate-800 dark:text-white capitalize">{displayTitle}</span>
        <button onClick={handleNext} className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition-all active:scale-95"><ChevronRight className="w-6 h-6" /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center">
                <div className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('overview')}</h3>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> {t('income')}</div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-full bg-orange-500"></span> {t('expense')}</div>
            </div>
          </div>
           <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis width={45} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(val)} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="income" name={t('income')} fill="#059669" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name={t('expense')} fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col justify-center gap-6">
            <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">{t('totalIncome')}</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.income)}</p>
            </div>
             <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
             <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">{t('totalExpense')}</p>
                <p className="text-3xl font-bold text-orange-500 dark:text-orange-400">{formatCurrency(totals.expense)}</p>
            </div>
             <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>
             <div className="text-center">
                <p className="text-lg font-bold text-slate-800 dark:text-white mb-1">{t('balance')}</p>
                <p className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>{formatCurrency(totals.balance)}</p>
            </div>
        </div>
      </div>

      <MatrixTable title={t('incomeBreakdown')} dataObj={incomeMatrix} grandTotal={totals.income} themeColor="text-emerald-600 dark:text-emerald-400" />
      <MatrixTable title={t('expenseBreakdown')} dataObj={expenseMatrix} grandTotal={totals.expense} themeColor="text-orange-500 dark:text-orange-400" />
    </div>
  );
};

export default PeriodStats;