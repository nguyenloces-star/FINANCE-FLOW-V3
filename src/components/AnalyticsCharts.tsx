import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currentDate: Date;
  periodType?: 'month' | 'year';
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ transactions, currentDate, periodType = 'month' }) => {
  const { t } = useLanguage();
  const isYearly = periodType === 'year';

  const lineChartData = useMemo(() => {
    const data = [];
    if (isYearly) {
        for (let i = 0; i < 12; i++) {
            const monthStr = t('months').split(',')[i];
            let income = 0, expense = 0;
            transactions.forEach(tx => {
                const txDate = new Date(tx.date);
                if (txDate.getFullYear() === currentDate.getFullYear() && txDate.getMonth() === i) {
                    if (tx.type === TransactionType.INCOME) income += tx.amount;
                    else expense += tx.amount;
                }
            });
            data.push({ date: monthStr, income, expense });
        }
    } else {
        for (let i = -3; i <= 3; i++) {
            const targetDate = new Date(currentDate);
            targetDate.setDate(currentDate.getDate() + i);
            const dayStr = targetDate.getDate().toString().padStart(2, '0');
            const monthStr = (targetDate.getMonth() + 1).toString().padStart(2, '0');
            const dateDisplay = `${dayStr}/${monthStr}`;

            let income = 0, expense = 0;
            transactions.forEach(tx => {
                const txDate = new Date(tx.date);
                if (txDate.getDate() === targetDate.getDate() && txDate.getMonth() === targetDate.getMonth() && txDate.getFullYear() === targetDate.getFullYear()) {
                    if (tx.type === TransactionType.INCOME) income += tx.amount;
                    else expense += tx.amount;
                }
            });
            data.push({ date: dateDisplay, income, expense });
        }
    }
    return data;
  }, [transactions, currentDate, isYearly, t]);

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 backdrop-blur-sm min-w-[180px] z-50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm mb-2 last:mb-0">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }} /><span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name === 'Income' ? t('income') : t('expense')}</span></div>
              <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t('cashFlowTrend')} ({isYearly ? t('months12') : t('days7')})</h3>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> {t('income')}</div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"><span className="w-3 h-3 rounded-full bg-orange-500"></span> {t('expense')}</div>
            </div>
        </div>
        <div className="h-[250px] md:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.2}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ea580c" stopOpacity={0.2}/><stop offset="95%" stopColor="#ea580c" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.4} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
              <YAxis width={45} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} tickFormatter={(value) => new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value)} />
              <Tooltip content={<CustomAreaTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 6, strokeWidth: 0, fill: "#059669" }} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 6, strokeWidth: 0, fill: "#ea580c" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
  );
};