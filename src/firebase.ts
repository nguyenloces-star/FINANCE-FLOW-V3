import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDyV5dVJvuM03C9t8U2_DRrP-3L6Z_GhQ",
  authDomain: "finance-flow-v3.firebaseapp.com",
  projectId: "finance-flow-v3",
  storageBucket: "finance-flow-v3.firebasestorage.app",
  messagingSenderId: "434627867408",
  appId: "1:434627867408:web:b7a69eec7e8faa901e6b95"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

console.log("🔥 Connected to NEW Firebase Project:", firebaseConfig.projectId);

export { db, app };