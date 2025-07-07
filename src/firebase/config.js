// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
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

// Initialize Firebase services with optimizations
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence and optimize Firestore
try {
  // Enable network for better performance
  enableNetwork(db).catch((error) => {
    console.warn('Failed to enable Firestore network:', error);
  });
} catch (error) {
  console.warn('Firestore network configuration warning:', error);
}

// Set auth persistence
auth.settings = {
  appVerificationDisabledForTesting: false
};

console.log('Firebase services initialized successfully');

export default app;