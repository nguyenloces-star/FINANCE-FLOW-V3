import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { CATEGORY_ITEMS } from '../constants';
import { generateId } from '../utils';
import { useLanguage } from '../contexts/LanguageContext';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => void;
  initialData?: Transaction | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useLanguage();

  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note || '');
      setIsRecurring(initialData.isRecurring || false);
      setFrequency(initialData.frequency || 'monthly');
    } else {
      setType(TransactionType.EXPENSE);
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setIsRecurring(false);
      setFrequency('monthly');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const currentCategories = CATEGORY_ITEMS.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;

    onSubmit({
      id: initialData?.id || generateId(),
      type,
      amount: parseFloat(amount),
      category, // Lưu bằng ID gốc vào Database
      date,
      note,
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
      createdAt: initialData?.createdAt || Date.now()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {initialData ? t('editTransaction') : t('addTransaction')}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* Toggle Type */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button type="button" onClick={() => { setType(TransactionType.EXPENSE); setCategory(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
              {t('expense')}
            </button>
            <button type="button" onClick={() => { setType(TransactionType.INCOME); setCategory(''); }} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
              {t('income')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('amount')}</label>
              <input type="number" required min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white text-lg font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('date')}</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white text-sm" />
            </div>
          </div>

          {/* ICON GRID CATEGORY */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('category')}</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {currentCategories.map(c => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                const activeColor = type === TransactionType.EXPENSE ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
                
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    // THAY ĐỔI: justify-center để căn giữa hoàn toàn theo chiều dọc
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 h-24 md:h-28 ${isSelected ? activeColor : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    <div className={`p-2.5 rounded-full mb-2 flex-shrink-0 ${isSelected ? (type === TransactionType.EXPENSE ? 'text-rose-600 bg-rose-100 dark:bg-rose-900/50' : 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50') : 'text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300'}`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    {/* THAY ĐỔI: Tăng font size lên text-xs md:text-sm */}
                    <span className={`text-xs md:text-sm leading-tight font-bold text-center break-words w-full ${isSelected ? (type === TransactionType.EXPENSE ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400') : 'text-slate-600 dark:text-slate-400'}`}>
                      {t(`cat_${c.id}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('note')}</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="..." className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
            <input type="checkbox" id="recurring" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
            <label htmlFor="recurring" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none flex-1">
              {t('recurringTx')}
            </label>
            {isRecurring && (
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="p-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white">
                <option value="monthly">{t('monthly')}</option>
                <option value="yearly">{t('yearlyFreq')}</option>
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-800">
          <button onClick={handleSubmit} disabled={!amount || !category} className="w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};