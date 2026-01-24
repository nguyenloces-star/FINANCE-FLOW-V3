import {
  Briefcase,
  PiggyBank,
  Landmark,
  HandCoins,
  Camera,
  Palette,
  MoreHorizontal,
  ShoppingCart,
  Sunrise,
  Utensils,
  Coffee,
  Film,
  ShoppingBag,
  Car,
  Zap,
  Droplets,
  Wifi,
  CreditCard,
  TrendingUp,
  Gift,
  HeartPulse
} from 'lucide-react';
import { TransactionType, CategoryItem } from './types';

export const CATEGORY_ITEMS: CategoryItem[] = [
  // --- INCOME CATEGORIES ---
  { id: 'salary', name: 'Salary', icon: Briefcase, type: TransactionType.INCOME, color: '#10b981' },
  { id: 'savings_interest', name: 'Savings Interest', icon: PiggyBank, type: TransactionType.INCOME, color: '#34d399' },
  { id: 'loan', name: 'Loan', icon: Landmark, type: TransactionType.INCOME, color: '#6ee7b7' },
  { id: 'debt_collection', name: 'Debt Collection', icon: HandCoins, type: TransactionType.INCOME, color: '#059669' },
  { id: 'photography', name: 'Photography', icon: Camera, type: TransactionType.INCOME, color: '#facc15' },
  { id: 'design', name: 'Design', icon: Palette, type: TransactionType.INCOME, color: '#a7f3d0' },
  { id: 'other_income', name: 'Other Income', icon: MoreHorizontal, type: TransactionType.INCOME, color: '#9ca3af' },

  // --- EXPENSE CATEGORIES ---
  { id: 'groceries', name: 'Groceries', icon: ShoppingCart, type: TransactionType.EXPENSE, color: '#f97316' }, // Orange
  { id: 'breakfast', name: 'Breakfast', icon: Sunrise, type: TransactionType.EXPENSE, color: '#f59e0b' }, // Amber
  { id: 'lunch', name: 'Lunch', icon: Utensils, type: TransactionType.EXPENSE, color: '#ef4444' }, // Red
  { id: 'coffee', name: 'Coffee & Social', icon: Coffee, type: TransactionType.EXPENSE, color: '#854d0e' }, // Brown-ish
  { id: 'entertainment', name: 'Entertainment', icon: Film, type: TransactionType.EXPENSE, color: '#db2777' }, // Pink
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag, type: TransactionType.EXPENSE, color: '#ec4899' }, // Pink-500
  { id: 'transport', name: 'Transportation', icon: Car, type: TransactionType.EXPENSE, color: '#3b82f6' }, // Blue
  { id: 'electricity', name: 'Electricity Bill', icon: Zap, type: TransactionType.EXPENSE, color: '#eab308' }, // Yellow
  { id: 'water', name: 'Water Bill', icon: Droplets, type: TransactionType.EXPENSE, color: '#06b6d4' }, // Cyan
  { id: 'internet', name: 'Internet Bill', icon: Wifi, type: TransactionType.EXPENSE, color: '#6366f1' }, // Indigo
  { id: 'debt_repayment', name: 'Debt Repayment', icon: CreditCard, type: TransactionType.EXPENSE, color: '#8b5cf6' }, // Violet
  { id: 'investment_exp', name: 'Investment', icon: TrendingUp, type: TransactionType.EXPENSE, color: '#14b8a6' }, // Teal
  { id: 'social', name: 'Social Events/Gifts', icon: Gift, type: TransactionType.EXPENSE, color: '#f43f5e' }, // Rose
  { id: 'health', name: 'Medical & Health', icon: HeartPulse, type: TransactionType.EXPENSE, color: '#be123c' }, // Dark Red
  { id: 'other_expense', name: 'Other', icon: MoreHorizontal, type: TransactionType.EXPENSE, color: '#64748b' }, // Slate
];

export const getCategoryById = (id: string): CategoryItem => {
  return CATEGORY_ITEMS.find(c => c.id === id) || {
    id: 'unknown',
    name: 'Unknown',
    icon: MoreHorizontal,
    type: TransactionType.EXPENSE,
    color: '#94a3b8'
  };
};