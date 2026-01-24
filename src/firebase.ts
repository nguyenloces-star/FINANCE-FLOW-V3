import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwmQ8qDDvXed-Gh3dMAhmtekHbmyQ40ew",
  authDomain: "financeflow-new.firebaseapp.com",
  projectId: "financeflow-new",
  storageBucket: "financeflow-new.firebasestorage.app",
  messagingSenderId: "620176775999",
  appId: "1:620176775999:web:ef8b50219c9d42c9cbd18a"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

console.log("🔥 Connected to NEW Firebase Project:", firebaseConfig.projectId);

export { db, app };