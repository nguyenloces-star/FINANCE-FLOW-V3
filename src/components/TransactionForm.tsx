import React, { useState, useEffect } from 'react';
import { X, Save, Check, RefreshCw } from 'lucide-react';
import { Transaction, TransactionType, RecurringFrequency } from '../types';
import { CATEGORY_ITEMS } from '../constants';
import { generateId } from '../utils';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => void;
  initialData?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  
  // Recurring State
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');

  // Reset or Load Data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setType(initialData.type);
        setCategoryId(initialData.category);
        setDate(initialData.date);
        setNote(initialData.note);
        setIsRecurring(!!initialData.isRecurring);
        setFrequency(initialData.frequency || 'monthly');
      } else {
        resetForm();
      }
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setAmount('');
    setType(TransactionType.EXPENSE);
    const defaultCat = CATEGORY_ITEMS.find(c => c.type === TransactionType.EXPENSE);
    setCategoryId(defaultCat?.id || '');
    setDate(new Date().toISOString().slice(0, 10));
    setNote('');
    setIsRecurring(false);
    setFrequency('monthly');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !date) return;

    const transaction: Transaction = {
      id: initialData ? initialData.id : generateId(),
      amount: parseFloat(amount),
      type,
      category: categoryId,
      date,
      note,
      createdAt: initialData ? initialData.createdAt : Date.now(),
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
    };

    onSubmit(transaction);
    onClose();
  };

  const currentCategories = CATEGORY_ITEMS.filter(c => c.type === type);

  const bgColor = type === TransactionType.INCOME ? 'bg-emerald-600' : 'bg-rose-600';
  const lightBgColor = type === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20';
  const textColor = type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
  const borderColor = type === TransactionType.INCOME ? 'border-emerald-200 dark:border-emerald-800' : 'border-rose-200 dark:border-rose-800';
  const ringColor = type === TransactionType.INCOME ? 'focus:ring-emerald-500' : 'focus:ring-rose-500';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-100 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5 custom-scrollbar">
          
          {/* Type Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType(TransactionType.EXPENSE);
                if (type !== TransactionType.EXPENSE) {
                   const defaultCat = CATEGORY_ITEMS.find(c => c.type === TransactionType.EXPENSE);
                   setCategoryId(defaultCat?.id || '');
                }
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === TransactionType.EXPENSE
                  ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType(TransactionType.INCOME);
                if (type !== TransactionType.INCOME) {
                   const defaultCat = CATEGORY_ITEMS.find(c => c.type === TransactionType.INCOME);
                   setCategoryId(defaultCat?.id || '');
                }
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === TransactionType.INCOME
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount</label>
            <div className="relative group">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold ${textColor ? textColor : 'text-slate-400'}`}>₫</span>
              <input
                type="number"
                inputMode="decimal" // <--- THÊM DÒNG NÀY: Kích hoạt bàn phím số
                pattern="[0-9]*"    // <--- THÊM DÒNG NÀY: Hỗ trợ iOS cũ
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-2xl text-2xl font-bold text-slate-800 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${ringColor} focus:border-transparent focus:ring-2`}
                placeholder="0"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 text-sm font-medium text-slate-800 dark:text-white dark:[color-scheme:dark]"
            />
          </div>

          {/* Category Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {currentCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `${lightBgColor} ${borderColor} ${textColor}`
                        : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-100 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${isSelected ? 'bg-white/50 dark:bg-slate-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurring Option */}
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
             <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        id="recurring" 
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-slate-900 dark:checked:bg-primary transition-all"
                    />
                    <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <label htmlFor="recurring" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    Recurring Transaction?
                </label>
             </div>
             
             {isRecurring && (
                 <div className="pl-7 animate-in slide-in-from-top-2 duration-200">
                     <select 
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-200"
                     >
                         <option value="monthly">Monthly</option>
                         <option value="yearly">Yearly</option>
                     </select>
                 </div>
             )}
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 text-sm font-medium text-slate-800 dark:text-white resize-none"
              placeholder="Description (optional)..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <button
            onClick={handleSubmit}
            className={`w-full flex items-center justify-center gap-2 ${bgColor} hover:opacity-90 text-white text-base font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98]`}
          >
            <Save className="w-5 h-5" />
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
};