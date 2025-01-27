import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chat-app-f9712.firebaseapp.com",
  projectId: "chat-app-f9712",
  storageBucket: "chat-app-f9712.firebasestorage.app",
  messagingSenderId: "1072595884989",
  appId: "1:1072595884989:web:1feb6504ea1aa635b750d4",
  measurementId: "G-FD565T3198",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage()
