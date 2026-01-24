import * as XLSX from 'xlsx';
import { Transaction, TransactionType } from './types';
import { getCategoryById } from './constants';

export const formatCurrency = (amount: number): string => {
  // Use English locale for comma separator, append Vietnamese currency symbol
  return new Intl.NumberFormat('en-US').format(amount) + ' ₫';
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const getMonthName = (monthIndex: number): string => {
  // English month names (Short)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex] || `M${monthIndex + 1}`;
};

export const getCurrentMonthISO = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 7); // Returns YYYY-MM
};

export const exportToExcel = (transactions: Transaction[], filename: string = 'transactions.xlsx') => {
  const data = transactions.map(t => {
    const category = getCategoryById(t.category);
    return {
      'Date': formatDate(t.date),
      'Category': category.name,
      'Type': t.type === TransactionType.INCOME ? 'Income' : 'Expense',
      'Amount': t.amount,
      'Note': t.note,
      'Recurring': t.isRecurring ? 'Yes' : 'No'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, filename);
};