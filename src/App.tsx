import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Plus, LayoutDashboard, Calendar as CalendarIcon, Wallet, PiggyBank, Sun, Moon, Loader2 } from 'lucide-react';
import { Transaction, ViewMode, Budget } from './types';
import { StorageService } from './services/storageService';
import { TransactionForm } from './components/TransactionForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SyncStatusBanner } from './components/SyncStatusBanner';
import { useTheme } from './contexts/ThemeContext';
import { generateId } from './utils';

// Lazy load
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const BudgetView = lazy(() => import('./components/BudgetView').then(module => ({ default: module.BudgetView })));
const YearlyView = lazy(() => import('./components/YearlyView').then(module => ({ default: module.YearlyView })));

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // DỮ LIỆU BUDGET ĐƯỢC QUẢN LÝ Ở ĐÂY
  const [budgets, setBudgets] = useState<Budget[]>([]); 
  
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSyncError, setHasSyncError] = useState(false);
  
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [viewMode]);

  // Load cả Transaction và Budget cùng lúc
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [txResponse, budgetList] = await Promise.all([
          StorageService.getTransactions(),
          StorageService.getBudgets()
        ]);

        const loadedTxs = txResponse.data;
        setBudgets(budgetList);
        setHasSyncError(txResponse.syncError && !StorageService.isSuppressed());
        setTransactions(loadedTxs); 
        
        // Xử lý Recurring Transaction trong background
        handleRecurringTransactions(loadedTxs);

      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setHasSyncError(!StorageService.isSuppressed());
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
                  child.recurringId === t.id && 
                  child.date.startsWith(currentMonth)
              );

              if (!alreadyExists) {
                  const txDate = new Date(t.date);
                  if (txDate < new Date(now.getFullYear(), now.getMonth() + 1, 0)) {
                       const newTx: Transaction = {
                           ...t,
                           id: generateId(),
                           date: now.toISOString().slice(0, 10),
                           recurringId: t.id,
                           isRecurring: false,
                           createdAt: Date.now()
                       };
                       newTransactions.push(newTx);
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

  // --- HÀM XỬ LÝ BUDGET (Truyền xuống BudgetView) ---
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

  const NavLink = ({ mode, label }: { mode: ViewMode, label: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`w-32 py-2.5 rounded-full text-sm transition-all duration-200 ${
        viewMode === mode
          ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
          : 'bg-transparent text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
      }`}
    >
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-safe">
      <SyncStatusBanner show={hasSyncError} onStayOffline={() => setHasSyncError(false)} />
      
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-2xl">
                <Wallet className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
                <h1 className="text-lg md:text-xl font-bold leading-tight">Hello, Loc 👋</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
                <NavLink mode="dashboard" label="Overview" />
                <NavLink mode="budget" label="Budget" />
                <NavLink mode="yearly" label="Yearly" />
            </div>
            <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-24">
        <Suspense fallback={<LoadingSpinner />}>
          {viewMode === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEdit={openEditForm}
              onDelete={handleDeleteTransaction}
            />
          )}
          {viewMode === 'budget' && (
              <BudgetView 
                  transactions={transactions}
                  currentDate={currentDate}
                  // ĐÂY LÀ PHẦN QUAN TRỌNG ĐÃ CẬP NHẬT:
                  budgets={budgets} 
                  onSaveBudget={handleSaveBudget} 
                  onDeleteBudget={handleDeleteBudget}
              />
          )}
          {viewMode === 'yearly' && (
            <YearlyView
              transactions={transactions}
              year={currentYear}
              onYearChange={setCurrentYear}
            />
          )}
        </Suspense>
      </main>

      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:bottom-12 md:right-12 z-40">
        <button onClick={openAddForm} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg hover:scale-110 active:scale-95 transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => setViewMode('dashboard')} className={`flex flex-col items-center gap-1 w-full ${viewMode === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-5 h-5" /><span className="text-[10px] font-bold">Overview</span>
          </button>
          <button onClick={() => setViewMode('budget')} className={`flex flex-col items-center gap-1 w-full ${viewMode === 'budget' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <PiggyBank className="w-5 h-5" /><span className="text-[10px] font-bold">Budget</span>
          </button>
          <button onClick={() => setViewMode('yearly')} className={`flex flex-col items-center gap-1 w-full ${viewMode === 'yearly' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CalendarIcon className="w-5 h-5" /><span className="text-[10px] font-bold">Yearly</span>
          </button>
        </div>
      </div>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
        onSubmit={handleAddTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default App;