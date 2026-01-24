import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Cấu hình Firebase mới của bạn (FinanceFlow-New)
const firebaseConfig = {
  apiKey: "AIzaSyDwmQ8qDDvXed-Gh3dMAhmtekHbmyQ40ew",
  authDomain: "financeflow-new.firebaseapp.com",
  projectId: "financeflow-new",
  storageBucket: "financeflow-new.firebasestorage.app",
  messagingSenderId: "620176775999",
  appId: "1:620176775999:web:ef8b50219c9d42c9cbd18a"
};

// Khởi tạo Firebase
// Dòng này kiểm tra: Nếu App đã chạy rồi thì dùng lại, chưa có mới tạo mới (Tránh lỗi trên Vite)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo cơ sở dữ liệu Firestore
const db = getFirestore(app);

console.log("🔥 Connected to NEW Firebase Project:", firebaseConfig.projectId);

// Xuất db ra để các file khác sử dụng
export { db, app };