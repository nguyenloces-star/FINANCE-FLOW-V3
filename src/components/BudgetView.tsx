import React, { useState, useMemo } from 'react';
import { Plus, X, AlertCircle, PiggyBank, Trash2 } from 'lucide-react';
import { Budget, Transaction, TransactionType } from '../types';
import { CATEGORY_ITEMS, getCategoryById } from '../constants';
import { formatCurrency, generateId } from '../utils';

interface BudgetViewProps {
  transactions: Transaction[];
  currentDate: Date;
  budgets?: Budget[];
  onSaveBudget?: (budget: Budget) => Promise<void>;
  onDeleteBudget?: (id: string) => Promise<void>;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ 
    transactions, 
    currentDate, 
    budgets = [], 
    onSaveBudget, 
    onDeleteBudget 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ITEMS.filter(c => c.type === TransactionType.EXPENSE)[0].id);
  const [limitAmount, setLimitAmount] = useState('');

  const expenseCategories = useMemo(() => 
    CATEGORY_ITEMS.filter(c => c.type === TransactionType.EXPENSE),
  []);

  const handleSave = async () => {
    if (!limitAmount || !onSaveBudget) return;
    const safeBudgets = budgets || [];
    const existing = safeBudgets.find(b => b.categoryId === selectedCategory);
    
    const newBudget: Budget = {
        id: existing ? existing.id : generateId(),
        categoryId: selectedCategory,
        limit: parseFloat(limitAmount)
    };
    
    await onSaveBudget(newBudget);
    setIsAdding(false);
    setLimitAmount('');
  };

  const budgetStats = useMemo(() => {
    if (!transactions || !budgets) return [];

    const currentMonthExpenses = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear() &&
             t.type === TransactionType.EXPENSE;
    });

    return (budgets || []).map(budget => {
        const spent = currentMonthExpenses
            .filter(t => t.category === budget.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percent = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
        const category = getCategoryById(budget.categoryId);
        
        // FIX: Ép kiểu any để tránh lỗi TypeScript khi thiếu field theme
        const safeCategory = category as any; 
        
        return { 
          ...budget, 
          spent, 
          percent, 
          categoryName: category.name, 
          categoryIcon: category.icon, 
          categoryTheme: safeCategory.theme || 'bg-slate-100 text-slate-600' // Giá trị mặc định an toàn
        };
    }).sort((a, b) => b.percent - a.percent);
  }, [budgets, transactions, currentDate]);

  if (!onSaveBudget || !onDeleteBudget) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Monthly Budget</h2>
        <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
            <Plus className="w-4 h-4" /> Setup
        </button>
      </div>

      {isAdding && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Set Budget Limit</h3>
                  <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Category</label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                      >
                          {expenseCategories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Amount</label>
                      <input 
                        type="number" 
                        inputMode="decimal" 
                        pattern="[0-9]*"    
                        value={limitAmount}
                        onChange={(e) => setLimitAmount(e.target.value)}
                        placeholder="0"
                        autoFocus
                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                      />
                  </div>
              </div>
              <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20">
                  Save Budget
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 gap-4">
          {budgetStats.length > 0 ? (
            budgetStats.map(stat => {
                const Icon = stat.categoryIcon;
                let progressColor = 'bg-emerald-500';
                if (stat.percent >= 100) progressColor = 'bg-rose-500';
                else if (stat.percent >= 80) progressColor = 'bg-amber-400';

                return (
                    <div key={stat.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${stat.categoryTheme}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{stat.categoryName}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {formatCurrency(stat.spent)} <span className="text-slate-300">/</span> {formatCurrency(stat.limit)}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => onDeleteBudget && onDeleteBudget(stat.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`} 
                                style={{ width: `${stat.percent}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.percent.toFixed(0)}% USED</span>
                          {stat.percent >= 100 && (
                              <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold uppercase tracking-wide">
                                  <AlertCircle className="w-3 h-3" /> Over Budget!
                              </div>
                          )}
                        </div>
                    </div>
                );
            })
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700/50">
                <div className="bg-slate-50 dark:bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No budgets setup for this month.</p>
                <button onClick={() => setIsAdding(true)} className="mt-4 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider hover:underline">Create First Budget</button>
            </div>
          )}
      </div>
    </div>
  );
};