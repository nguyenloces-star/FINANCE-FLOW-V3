import { Transaction, Budget } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc,
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy,
  Timestamp,
  setDoc
} from 'firebase/firestore';

const TRANSACTIONS_COLLECTION = 'transactions';
const BUDGETS_COLLECTION = 'budgets';

// Key lưu LocalStorage
const LOCAL_TX_KEY = 'finance_flow_transactions';
const LOCAL_BUDGET_KEY = 'finance_flow_budgets';

export const StorageService = {
  // --- Helpers ---
  getLocal: <T>(key: string): T[] => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  saveLocal: <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- Transactions ---

  getTransactions: async (): Promise<{ data: Transaction[]; error?: any }> => {
    try {
      // 1. Thử lấy từ Firebase
      const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const txs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      // 2. Nếu thành công, lưu backup vào Local
      StorageService.saveLocal(LOCAL_TX_KEY, txs);
      return { data: txs };

    } catch (error) {
      console.warn('⚠️ Offline mode or Firebase Error:', error);
      // 3. Nếu lỗi mạng, lấy từ Local ra dùng tạm
      const localData = StorageService.getLocal<Transaction>(LOCAL_TX_KEY);
      return { data: localData, error };
    }
  },

  addTransaction: async (transaction: Transaction) => {
    // 1. Lưu Local trước để giao diện cập nhật ngay (Optimistic UI)
    const local = StorageService.getLocal<Transaction>(LOCAL_TX_KEY);
    StorageService.saveLocal(LOCAL_TX_KEY, [transaction, ...local]);

    // 2. Đẩy lên Firebase
    try {
      // Dùng setDoc để giữ nguyên ID do frontend tạo ra (nếu có)
      await setDoc(doc(db, TRANSACTIONS_COLLECTION, transaction.id), {
        ...transaction,
        updatedAt: Timestamp.now() 
      });
    } catch (error) {
      console.error('Save to Cloud failed:', error);
      // Có thể thêm logic hàng đợi (queue) để sync lại sau
    }
  },

  deleteTransaction: async (id: string) => {
    const local = StorageService.getLocal<Transaction>(LOCAL_TX_KEY);
    StorageService.saveLocal(LOCAL_TX_KEY, local.filter(t => t.id !== id));

    try {
      await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
    } catch (error) {
      console.error('Delete from Cloud failed:', error);
    }
  },

  // --- Budgets ---
  // (Logic tương tự như Transaction)
  getBudgets: async (): Promise<Budget[]> => {
    try {
      const snapshot = await getDocs(collection(db, BUDGETS_COLLECTION));
      const budgets = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Budget[];
      StorageService.saveLocal(LOCAL_BUDGET_KEY, budgets);
      return budgets;
    } catch (error) {
      return StorageService.getLocal<Budget>(LOCAL_BUDGET_KEY);
    }
  },

  saveBudget: async (budget: Budget) => {
     // Save Local
     const local = StorageService.getLocal<Budget>(LOCAL_BUDGET_KEY);
     const index = local.findIndex(b => b.id === budget.id);
     if (index >= 0) local[index] = budget; else local.push(budget);
     StorageService.saveLocal(LOCAL_BUDGET_KEY, local);

     // Save Cloud
     try {
       await setDoc(doc(db, BUDGETS_COLLECTION, budget.id), budget);
     } catch (e) { console.error(e); }
  },

  deleteBudget: async (id: string) => {
    const local = StorageService.getLocal<Budget>(LOCAL_BUDGET_KEY);
    StorageService.saveLocal(LOCAL_BUDGET_KEY, local.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, BUDGETS_COLLECTION, id));
    } catch (e) { console.error(e); }
  }
};