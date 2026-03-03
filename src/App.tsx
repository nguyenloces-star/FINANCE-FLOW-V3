import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Plus, Calendar as CalendarIcon, Wallet, PiggyBank, Sun, Moon, Loader2, LineChart as LineChartIcon, LayoutList } from 'lucide-react';
import { Transaction, ViewMode, Budget } from './types';
import { StorageService } from './services/storageService';
import { TransactionForm } from './components/TransactionForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useTheme } from './contexts/ThemeContext';
import { generateId } from './utils';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const Dashboard = lazy(() => import('./components/Dashboard'));
const BudgetView = lazy(() => import('./components/BudgetView'));
const PeriodStats = lazy(() => import('./components/PeriodStats'));

const AppContent: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]); 
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [viewMode]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [txResponse, budgetList] = await Promise.all([
          StorageService.getTransactions(),
          StorageService.getBudgets()
        ]);
        const loadedTxs = Array.isArray(txResponse) ? txResponse : (txResponse as any).data || [];
        setBudgets(budgetList);
        setTransactions(loadedTxs); 
        handleRecurringTransactions(loadedTxs);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRecurringTransactions = async (currentTxs: Transaction[]) => {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7);
      const newTransactions: Transaction[] = [];

      currentTxs.forEach(t => {
          if (t.isRecurring && t.frequency === 'monthly') {
              const alreadyExists = currentTxs.some(child => 
                  child.recurringId === t.id && child.date.startsWith(currentMonth)
              );
              if (!alreadyExists) {
                  const txDate = new Date(t.date);
                  if (txDate < new Date(now.getFullYear(), now.getMonth() + 1, 0)) {
                       newTransactions.push({
                           ...t, id: generateId(), date: now.toISOString().slice(0, 10),
                           recurringId: t.id, isRecurring: false, createdAt: Date.now()
                       });
                  }
              }
          }
      });
      if (newTransactions.length > 0) {
          setTransactions(prev => [...prev, ...newTransactions]);
          await Promise.all(newTransactions.map(t => StorageService.addTransaction(t)));
      }
  };

  const handleAddTransaction = async (newTx: Transaction) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => (t.id === newTx.id ? newTx : t)));
      setEditingTransaction(null);
      await StorageService.updateTransaction(newTx);
    } else {
      setTransactions(prev => [newTx, ...prev]);
      await StorageService.addTransaction(newTx);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm('Delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      await StorageService.deleteTransaction(id);
    }
  };

  const handleSaveBudget = useCallback(async (budget: Budget) => {
      setBudgets(prev => {
          const idx = prev.findIndex(b => b.id === budget.id);
          if (idx >= 0) {
              const newArr = [...prev];
              newArr[idx] = budget;
              return newArr;
          }
          return [...prev, budget];
      });
      await StorageService.saveBudget(budget);
  }, []);

  const handleDeleteBudget = useCallback(async (id: string) => {
      setBudgets(prev => prev.filter(b => b.id !== id));
      await StorageService.deleteBudget(id);
  }, []);

  const openAddForm = () => { setEditingTransaction(null); setIsFormOpen(true); };
  const openEditForm = (tx: Transaction) => { setEditingTransaction(tx); setIsFormOpen(true); };

  const NavLink = ({ mode, label, icon: Icon }: { mode: ViewMode, label: string, icon: any }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        viewMode === mode
          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-2xl">
                <Wallet className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
                <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">FinanceFlow</h1>
            </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('menu')}</p>
            <NavLink mode="dashboard" label={t('dashboard')} icon={LineChartIcon} />
            <NavLink mode="budget" label={t('budget')} icon={PiggyBank} />
            <NavLink mode="monthly" label={t('monthlyView')} icon={LayoutList} />
            <NavLink mode="yearly" label={t('yearly')} icon={CalendarIcon} />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4">
            <button onClick={toggleLanguage} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {language === 'en' ? 'VI' : 'EN'}
            </button>
            <button onClick={toggleTheme} className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* HEADER MOBILE (Đã Căn Giữa Hoàn Hảo & Sticky) */}
        <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-20 pt-[env(safe-area-inset-top)] sticky top-0">
            <div className="flex items-center justify-between px-4 h-16">
                <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                    <h1 className="text-lg font-bold">FinanceFlow</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleLanguage} className="w-9 h-9 flex justify-center items-center rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-xs">{language === 'en' ? 'VI' : 'EN'}</button>
                    <button onClick={toggleTheme} className="w-9 h-9 flex justify-center items-center rounded-full bg-slate-100 dark:bg-slate-800">
                       {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full custom-scrollbar pb-24 md:pb-0">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8">
            <Suspense fallback={<LoadingSpinner />}>
              {viewMode === 'dashboard' && <Dashboard transactions={transactions} currentDate={currentDate} onDateChange={setCurrentDate} onEdit={openEditForm} onDelete={handleDeleteTransaction} />}
              {viewMode === 'budget' && <BudgetView transactions={transactions} currentDate={currentDate} budgets={budgets} onSaveBudget={handleSaveBudget} onDeleteBudget={handleDeleteBudget} />}
              {viewMode === 'monthly' && <PeriodStats transactions={transactions} periodType="month" currentDate={currentDate} onDateChange={setCurrentDate} />}
              {viewMode === 'yearly' && <PeriodStats transactions={transactions} periodType="year" currentDate={currentDate} onDateChange={setCurrentDate} />}
            </Suspense>
          </div>
        </main>

        <div className="absolute bottom-20 md:bottom-10 right-4 md:right-10 z-40">
          <button onClick={openAddForm} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-[0_8px_30px_rgb(5,150,105,0.4)] hover:scale-110 active:scale-95 transition-all">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => setViewMode('dashboard')} className={`flex flex-col items-center gap-1 w-full ${viewMode === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <LineChartIcon className="w-5 h-5" /><span className="text-[10px] font-bold">{t('dashboard')}</span>
          </button>
          <button onClick={() => setViewMode('budget')} className={`flex flex-col items-center gap-1 w-full ${viewMode === 'budget' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <PiggyBank className="w-5 h-5" /><span className="text-[10px] font-bold">{t('budget')}</span>
          </button>
          <button onClick={() => setViewMode('monthly')} className={`flex flex-col items-center gap-1 w-full ${viewMode === 'monthly' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <LayoutList className="w-5 h-5" /><span className="text-[10px] font-bold">{t('monthlyView')}</span>
          </button>
          <button onClick={() => setViewMode('yearly')} className={`flex flex-col items-center gap-1 w-full ${viewMode === 'yearly' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CalendarIcon className="w-5 h-5" /><span className="text-[10px] font-bold">{t('yearly')}</span>
          </button>
        </div>
      </div>

      <TransactionForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} onSubmit={handleAddTransaction} initialData={editingTransaction} />
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;