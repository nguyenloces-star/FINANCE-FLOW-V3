import { Transaction, Budget } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc,
  doc, 
  query, 
  orderBy,
  Timestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';

const TRANSACTIONS_COLLECTION = 'transactions';
const BUDGETS_COLLECTION = 'budgets';

// Key lưu LocalStorage
const LOCAL_TX_KEY = 'finance_flow_transactions';
const LOCAL_BUDGET_KEY = 'finance_flow_budgets';

// --- HÀM MỚI: LÀM SẠCH DỮ LIỆU (FIX LỖI UNDEFINED) ---
// Hàm này sẽ xóa bỏ các trường có giá trị undefined trước khi gửi lên Firebase
const cleanData = (data: any) => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

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
    // 1. Lưu Local trước (Optimistic UI)
    const local = StorageService.getLocal<Transaction>(LOCAL_TX_KEY);
    StorageService.saveLocal(LOCAL_TX_KEY, [transaction, ...local]);

    // 2. Đẩy lên Firebase (ĐÃ FIX: Dùng cleanData để lọc lỗi)
    try {
      await setDoc(doc(db, TRANSACTIONS_COLLECTION, transaction.id), cleanData({
        ...transaction,
        updatedAt: Timestamp.now() 
      }));
      console.log("✅ Saved to Cloud:", transaction.id);
    } catch (error) {
      console.error('❌ Save to Cloud failed:', error);
    }
  },

  // Bổ sung hàm Update bị thiếu
  updateTransaction: async (transaction: Transaction) => {
    // 1. Update Local
    const local = StorageService.getLocal<Transaction>(LOCAL_TX_KEY);
    const index = local.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
        local[index] = transaction;
        StorageService.saveLocal(LOCAL_TX_KEY, local);
    }

    // 2. Update Cloud (ĐÃ FIX: Dùng cleanData)
    try {
        const docRef = doc(db, TRANSACTIONS_COLLECTION, transaction.id);
        await updateDoc(docRef, cleanData({
            ...transaction,
            updatedAt: Timestamp.now()
        }));
    } catch (error) {
        console.error('❌ Update Cloud failed:', error);
    }
  },

  deleteTransaction: async (id: string) => {
    const local = StorageService.getLocal<Transaction>(LOCAL_TX_KEY);
    StorageService.saveLocal(LOCAL_TX_KEY, local.filter(t => t.id !== id));

    try {
      await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
    } catch (error) {
      console.error('❌ Delete from Cloud failed:', error);
    }
  },

  // --- Budgets ---
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

     // Save Cloud (ĐÃ FIX: Dùng cleanData)
     try {
       await setDoc(doc(db, BUDGETS_COLLECTION, budget.id), cleanData(budget));
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