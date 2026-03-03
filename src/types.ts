import { ReactNode } from 'react';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export type RecurringFrequency = 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string; // Category ID
  date: string; // ISO String YYYY-MM-DD
  note: string;
  createdAt: number;
  // Recurring Fields
  isRecurring?: boolean;
  frequency?: RecurringFrequency;
  recurringId?: string; // Links generated transactions back to the original template
}

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}

export type ViewMode = 'dashboard' | 'budget' | 'monthly' | 'yearly';

export interface CategoryItem {
  id: string;
  name: string;
  icon: any; // LucideIcon type
  type: TransactionType;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
}