import { TransactionType } from './types';
import { 
  Utensils, Coffee, Gamepad2, ShoppingBag, Car, Zap, Droplets, Wifi, 
  CreditCard, TrendingUp, Gift, HeartPulse, MoreHorizontal,
  Banknote, PiggyBank, HandCoins, ArrowUpRight, Camera, Palette, PlusCircle
} from 'lucide-react';

export const CATEGORY_ITEMS = [
  // ================= EXPENSE CATEGORIES =================
  { id: 'food', type: TransactionType.EXPENSE, icon: Utensils, color: '#ef4444', theme: 'bg-rose-100 text-rose-600' },
  { id: 'coffee_social', type: TransactionType.EXPENSE, icon: Coffee, color: '#f97316', theme: 'bg-orange-100 text-orange-600' },
  { id: 'entertainment', type: TransactionType.EXPENSE, icon: Gamepad2, color: '#8b5cf6', theme: 'bg-violet-100 text-violet-600' },
  { id: 'shopping', type: TransactionType.EXPENSE, icon: ShoppingBag, color: '#ec4899', theme: 'bg-pink-100 text-pink-600' },
  { id: 'transportation', type: TransactionType.EXPENSE, icon: Car, color: '#eab308', theme: 'bg-yellow-100 text-yellow-600' },
  { id: 'electricity', type: TransactionType.EXPENSE, icon: Zap, color: '#eab308', theme: 'bg-yellow-100 text-yellow-600' },
  { id: 'water', type: TransactionType.EXPENSE, icon: Droplets, color: '#3b82f6', theme: 'bg-blue-100 text-blue-600' },
  { id: 'internet', type: TransactionType.EXPENSE, icon: Wifi, color: '#6366f1', theme: 'bg-indigo-100 text-indigo-600' },
  { id: 'debt_repayment', type: TransactionType.EXPENSE, icon: CreditCard, color: '#dc2626', theme: 'bg-red-100 text-red-600' },
  { id: 'investment', type: TransactionType.EXPENSE, icon: TrendingUp, color: '#10b981', theme: 'bg-emerald-100 text-emerald-600' },
  { id: 'social_events', type: TransactionType.EXPENSE, icon: Gift, color: '#f43f5e', theme: 'bg-rose-100 text-rose-600' },
  { id: 'health', type: TransactionType.EXPENSE, icon: HeartPulse, color: '#ef4444', theme: 'bg-red-100 text-red-600' },
  { id: 'other_expense', type: TransactionType.EXPENSE, icon: MoreHorizontal, color: '#64748b', theme: 'bg-slate-100 text-slate-600' },

  // ================= INCOME CATEGORIES =================
  { id: 'salary', type: TransactionType.INCOME, icon: Banknote, color: '#10b981', theme: 'bg-emerald-100 text-emerald-600' },
  { id: 'savings_interest', type: TransactionType.INCOME, icon: PiggyBank, color: '#0ea5e9', theme: 'bg-sky-100 text-sky-600' },
  { id: 'loan', type: TransactionType.INCOME, icon: HandCoins, color: '#f59e0b', theme: 'bg-amber-100 text-amber-600' },
  { id: 'debt_collection', type: TransactionType.INCOME, icon: ArrowUpRight, color: '#8b5cf6', theme: 'bg-violet-100 text-violet-600' },
  { id: 'photography', type: TransactionType.INCOME, icon: Camera, color: '#ec4899', theme: 'bg-pink-100 text-pink-600' },
  { id: 'design', type: TransactionType.INCOME, icon: Palette, color: '#14b8a6', theme: 'bg-teal-100 text-teal-600' },
  { id: 'other_income', type: TransactionType.INCOME, icon: PlusCircle, color: '#64748b', theme: 'bg-slate-100 text-slate-600' }
];

export const getCategoryById = (id: string) => {
  return CATEGORY_ITEMS.find(c => c.id === id) || CATEGORY_ITEMS[CATEGORY_ITEMS.length - 1]; // Trả về 'other' nếu không tìm thấy
};