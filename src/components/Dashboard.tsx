import React, { useMemo } from 'react';
// Đã dọn dẹp các Icon thừa (Filter, Download)
import { Edit2, Trash2, Wallet, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Transaction, TransactionType, MonthlySummary } from '../types';
import { formatCurrency, formatDate } from '../utils'; // Đã dọn dẹp exportToExcel
import { AnalyticsCharts } from './AnalyticsCharts';
import { getCategoryById } from '../constants'; // Đã dọn dẹp CATEGORY_ITEMS
import { useLanguage } from '../contexts/LanguageContext';
import { StatCard } from './StatCard';
import { CategoryGrid } from './CategoryGrid';

interface DashboardProps {
  transactions: Transaction[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, currentDate, onDateChange, onEdit, onDelete }) => {
  const { t } = useLanguage();

  // LOGIC ĐÃ ĐƯỢC LÀM SẠCH: Loại bỏ hoàn toàn các state thừa của bộ lọc

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => new Date(tx.date).getFullYear() === currentDate.getFullYear())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentDate]);

  const prevYearSummary = useMemo(() => {
    const prevYear = currentDate.getFullYear() - 1;
    const prevTx = transactions.filter(tx => new Date(tx.date).getFullYear() === prevYear);
    return prevTx.reduce((acc, curr) => {
        if (curr.type === TransactionType.INCOME) { acc.income += curr.amount; acc.balance += curr.amount; } 
        else { acc.expense += curr.amount; acc.balance -= curr.amount; }
        return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [transactions, currentDate]);

  const recentIncome = useMemo(() => filteredTransactions.filter(tx => tx.type === TransactionType.INCOME), [filteredTransactions]);
  const recentExpenses = useMemo(() => filteredTransactions.filter(tx => tx.type === TransactionType.EXPENSE), [filteredTransactions]);

  const summary: MonthlySummary = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
        if (curr.type === TransactionType.INCOME) { acc.income += curr.amount; acc.balance += curr.amount; } 
        else { acc.expense += curr.amount; acc.balance -= curr.amount; }
        return acc;
      }, { income: 0, expense: 0, balance: 0 });
  }, [filteredTransactions]);

  const calcGrowth = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

  const handlePrevYear = () => { const d = new Date(currentDate); d.setFullYear(d.getFullYear() - 1); onDateChange(d); };
  const handleNextYear = () => { const d = new Date(currentDate); d.setFullYear(d.getFullYear() + 1); onDateChange(d); };

  const renderTxItem = (tx: Transaction) => {
    const category = getCategoryById(tx.category);
    const Icon = category.icon;
    const isIncome = tx.type === TransactionType.INCOME;
    
    return (
        <div key={tx.id} className="group flex items-center justify-between py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${isIncome ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100/80 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'}`}>
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white truncate">{t(`cat_${tx.category}`)}</p>
              <div className="flex items-center gap-2 truncate mt-0.5">
                 <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{formatDate(tx.date)}</p>
                 {tx.isRecurring && <span className="flex-shrink-0 text-[9px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded font-bold dark:bg-blue-900/40 dark:text-blue-300">{t('recurring')}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
            <div className="text-right">
              <p className={`font-bold text-sm md:text-base whitespace-nowrap ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'}`}>{formatCurrency(tx.amount)}</p>
              {tx.note && <p className="text-[10px] md:text-xs text-slate-400 max-w-[80px] md:max-w-[100px] truncate mt-0.5">{tx.note}</p>}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
              <button onClick={() => onEdit(tx)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => onDelete(tx.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
             <button onClick={() => onEdit(tx)} className="md:hidden text-slate-400 p-1"><Edit2 className="w-4 h-4" /></button>
          </div>
        </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header Điều hướng năm */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <button onClick={handlePrevYear} className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition-all active:scale-95"><ChevronLeft className="w-6 h-6" /></button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">{currentDate.getFullYear()}</h2>
        <button onClick={handleNextYear} className="p-3 rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-600 transition-all active:scale-95"><ChevronRight className="w-6 h-6" /></button>
      </div>

      {/* Cụm Thẻ Số Liệu Nằm Ngay Sát Biểu Đồ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard title={t('totalIncome')} amount={summary.income} growth={calcGrowth(summary.income, prevYearSummary.income)} growthText={t('vsLastYear')} type="income" icon={TrendingUp} />
        <StatCard title={t('totalExpense')} amount={summary.expense} growth={calcGrowth(summary.expense, prevYearSummary.expense)} growthText={t('vsLastYear')} type="expense" icon={TrendingDown} />
        <StatCard title={t('currentBalance')} amount={summary.balance} growth={calcGrowth(summary.balance, prevYearSummary.balance)} growthText={t('vsLastYear')} type="balance" icon={Wallet} />
      </div>

      {/* HOÀN TOÀN XÓA BỎ THANH NGANG CHỨA NÚT FILTER/EXPORT TẠI ĐÂY */}

      <AnalyticsCharts transactions={filteredTransactions} currentDate={currentDate} periodType="year" />

      <CategoryGrid transactions={filteredTransactions} currentDate={currentDate} periodType="year" type={TransactionType.INCOME} title={t('incomeBreakdown')} themeColor="text-emerald-600 dark:text-emerald-400" bgTheme="bg-emerald-100 dark:bg-emerald-900/40" />
      <CategoryGrid transactions={filteredTransactions} currentDate={currentDate} periodType="year" type={TransactionType.EXPENSE} title={t('expenseBreakdown')} themeColor="text-orange-500 dark:text-orange-400" bgTheme="bg-orange-100 dark:bg-orange-900/40" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Recent Income List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-[400px] md:h-[480px] overflow-hidden">
              <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                <div className="flex items-center"><div className="w-1 h-5 md:h-6 bg-emerald-600 rounded-full mr-2 md:mr-3"></div><h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('recentIncome')}</h3></div>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">{recentIncome.length}</span>
              </div>
              <div className="flex-1 overflow-auto p-3 md:p-4 custom-scrollbar">
                {recentIncome.length > 0 ? <div className="space-y-1.5">{recentIncome.map(renderTxItem)}</div> : <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50"><Wallet className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mb-3" /><p className="text-slate-400 text-sm font-medium">{t('noIncome')}</p></div>}
              </div>
          </div>
          
          {/* Recent Expense List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col h-[400px] md:h-[480px] overflow-hidden">
              <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                <div className="flex items-center"><div className="w-1 h-5 md:h-6 bg-orange-500 rounded-full mr-2 md:mr-3"></div><h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('recentExpenses')}</h3></div>
                <span className="text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg">{recentExpenses.length}</span>
              </div>
              <div className="flex-1 overflow-auto p-3 md:p-4 custom-scrollbar">
                {recentExpenses.length > 0 ? <div className="space-y-1.5">{recentExpenses.map(renderTxItem)}</div> : <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50"><Wallet className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mb-3" /><p className="text-slate-400 text-sm font-medium">{t('noExpense')}</p></div>}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;