// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCUj2W1V4c-yAW9_Wi2NeRliywbptV9i4",
  authDomain: "athuru-mithuru-339be.firebaseapp.com",
  projectId: "athuru-mithuru-339be",
  storageBucket: "athuru-mithuru-339be.firebasestorage.app",
  messagingSenderId: "691613758404",
  appId: "1:691613758404:web:53c7ca018e65d29a306a91",
  measurementId: "G-8D31KNWVNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Enable network persistence for Firestore
try {
  // This helps with offline functionality
  if (typeof window !== 'undefined') {
    // Only run in browser environment
    console.log('Firebase services initialized successfully');
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export default app;