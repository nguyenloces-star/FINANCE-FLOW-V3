import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi';

interface Translations {
  [key: string]: { en: string; vi: string; };
}

export const translations: Translations = {
  dashboard: { en: 'Dashboard', vi: 'Bảng điều khiển' },
  budget: { en: 'Budget', vi: 'Ngân sách' },
  monthlyView: { en: 'Monthly', vi: 'Hàng tháng' },
  yearly: { en: 'Yearly', vi: 'Hàng năm' },
  menu: { en: 'Menu', vi: 'Danh mục' },
  
  totalIncome: { en: 'Total Income', vi: 'Tổng thu' },
  totalExpense: { en: 'Total Expenses', vi: 'Tổng chi' },
  balance: { en: 'Balance', vi: 'Số dư' },
  income: { en: 'Income', vi: 'Thu nhập' },
  expense: { en: 'Expense', vi: 'Chi tiêu' },
  grandTotal: { en: 'Grand Total', vi: 'Tổng cộng' },
  month: { en: 'Month', vi: 'Tháng' },
  date: { en: 'Date', vi: 'Ngày' },
  share: { en: 'Share', vi: 'Tỷ trọng' },
  currentBalance: { en: 'Current Balance', vi: 'Số dư hiện tại' },
  overview: { en: 'Overview', vi: 'Tổng quan' },

  months: { 
    en: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec', 
    vi: 'Thg 1,Thg 2,Thg 3,Thg 4,Thg 5,Thg 6,Thg 7,Thg 8,Thg 9,Thg 10,Thg 11,Thg 12' 
  },
  days7: { en: '7 Days', vi: '7 Ngày' },
  months12: { en: '12 Months', vi: '12 Tháng' },

  recentTransactions: { en: 'Recent Transactions', vi: 'Giao dịch gần đây' },
  search: { en: 'Search transactions...', vi: 'Tìm kiếm giao dịch...' },
  noTransactions: { en: 'No transactions found.', vi: 'Không tìm thấy giao dịch nào.' },
  cashFlowTrend: { en: 'Cash Flow Trend', vi: 'Xu hướng dòng tiền' },
  incomeStructure: { en: 'Income Structure', vi: 'Cấu trúc thu nhập' },
  expenseStructure: { en: 'Expense Structure', vi: 'Cấu trúc chi tiêu' },
  filter: { en: 'Filter', vi: 'Lọc' },
  export: { en: 'Export', vi: 'Xuất file' },
  filterByCategory: { en: 'Filter by Category', vi: 'Lọc theo danh mục' },
  allCategories: { en: 'All Categories', vi: 'Tất cả danh mục' },
  recentIncome: { en: 'Recent Income', vi: 'Thu nhập gần đây' },
  recentExpenses: { en: 'Recent Expenses', vi: 'Chi tiêu gần đây' },
  noIncome: { en: 'No income records yet', vi: 'Chưa có khoản thu nào' },
  noExpense: { en: 'No expense records yet', vi: 'Chưa có khoản chi nào' },
  vsLastMonth: { en: 'vs last month', vi: 'so với tháng trước' },
  vsLastYear: { en: 'vs last year', vi: 'so với năm trước' },
  noData: { en: 'No data available', vi: 'Không có dữ liệu' },

  monthlyBudget: { en: 'Monthly Budget', vi: 'Ngân sách tháng' },
  setup: { en: 'Setup', vi: 'Thiết lập' },
  setBudgetLimit: { en: 'Set Budget Limit', vi: 'Đặt hạn mức ngân sách' },
  amount: { en: 'Amount', vi: 'Số tiền' },
  saveBudget: { en: 'Save Budget', vi: 'Lưu ngân sách' },
  overBudget: { en: 'Over Budget!', vi: 'Vượt ngân sách!' },
  used: { en: 'USED', vi: 'ĐÃ DÙNG' },
  noBudgetSetup: { en: 'No budgets setup for this month.', vi: 'Chưa có ngân sách nào cho tháng này.' },
  createFirstBudget: { en: 'Create First Budget', vi: 'Tạo ngân sách đầu tiên' },

  // FIX LỖI TEXT TẠI ĐÂY (CHUẨN CAPITALIZE)
  yearlyOverview: { en: 'Yearly Overview', vi: 'Tổng quan năm' },
  categoryBreakdown: { en: 'Category Breakdown', vi: 'Phân bổ chi tiết' },
  incomeBreakdown: { en: 'Income Breakdown', vi: 'Phân bổ thu nhập' },
  expenseBreakdown: { en: 'Expense Breakdown', vi: 'Phân bổ chi tiêu' },

  addTransaction: { en: 'Add Transaction', vi: 'Thêm giao dịch' },
  editTransaction: { en: 'Edit Transaction', vi: 'Sửa giao dịch' },
  category: { en: 'Category', vi: 'Danh mục' },
  note: { en: 'Note (Optional)', vi: 'Ghi chú (Tùy chọn)' },
  save: { en: 'Save Transaction', vi: 'Lưu giao dịch' },
  recurringTx: { en: 'Recurring Transaction', vi: 'Giao dịch định kỳ' },
  recurring: { en: 'Recurring', vi: 'Định kỳ' },
  monthlyFreq: { en: 'Monthly', vi: 'Hàng tháng' },
  yearlyFreq: { en: 'Yearly', vi: 'Hàng năm' },

  cat_food: { en: 'Food Costs', vi: 'Ăn uống' },
  cat_coffee_social: { en: 'Coffee & Social', vi: 'Café / Tiệc' },
  cat_entertainment: { en: 'Entertainment', vi: 'Giải trí' },
  cat_shopping: { en: 'Shopping', vi: 'Mua sắm' },
  cat_transportation: { en: 'Transportation', vi: 'Chi phí đi lại' },
  cat_electricity: { en: 'Electricity Bill', vi: 'Hóa đơn điện' },
  cat_water: { en: 'Water Bill', vi: 'Hóa đơn nước' },
  cat_internet: { en: 'Internet Bill', vi: 'Hóa đơn internet' },
  cat_debt_repayment: { en: 'Debt Repayment', vi: 'Trả nợ' },
  cat_investment: { en: 'Investments', vi: 'Đầu tư' },
  cat_social_events: { en: 'Social Events / Gifts', vi: 'Hiếu / hỉ / tang ma' },
  cat_health: { en: 'Medical & Health', vi: 'Sức khỏe' },
  cat_other_expense: { en: 'Other', vi: 'Khác' },
  cat_salary: { en: 'Salary', vi: 'Lương' },
  cat_savings_interest: { en: 'Savings Interest', vi: 'Lãi tiết kiệm' },
  cat_loan: { en: 'Loan', vi: 'Vay mượn' },
  cat_debt_collection: { en: 'Debt Collection', vi: 'Thu nợ' },
  cat_photography: { en: 'Photography', vi: 'Chụp ảnh' },
  cat_design: { en: 'Design', vi: 'Thiết kế' },
  cat_other_income: { en: 'Other Income', vi: 'Nguồn thu khác' }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'vi' : 'en');

  const t = (key: string) => {
    return translations[key] ? translations[key][language] : key; 
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};