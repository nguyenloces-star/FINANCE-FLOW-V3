import * as XLSX from 'xlsx';
import { Transaction, TransactionType } from './types';

export const formatCurrency = (amount: number): string => {
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

// Cập nhật để hỗ trợ đa ngôn ngữ nếu cần gọi riêng
export const getMonthName = (monthIndex: number, monthNamesString?: string): string => {
  if (monthNamesString) {
      const months = monthNamesString.split(',');
      return months[monthIndex] || `M${monthIndex + 1}`;
  }
  const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return defaultMonths[monthIndex] || `M${monthIndex + 1}`;
};

export const getCurrentMonthISO = (): string => {
  const now = new Date();
  return now.toISOString().slice(0, 7); 
};

// Đã thêm tham số t (hàm dịch) để xuất file Excel đúng ngôn ngữ
export const exportToExcel = (transactions: Transaction[], t: (key: string) => string, filename: string = 'transactions.xlsx') => {
  const data = transactions.map(tx => {
    return {
      [t('date')]: formatDate(tx.date),
      [t('category')]: t(`cat_${tx.category}`),
      [t('type')]: tx.type === TransactionType.INCOME ? t('income') : t('expense'),
      [t('amount')]: tx.amount,
      [t('note')]: tx.note,
      [t('recurring')]: tx.isRecurring ? 'Yes' : 'No'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, filename);
};