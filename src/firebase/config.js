// src/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for React Native (Expo)
const firebaseConfig = {
  apiKey: "AIzaSyBx5U9EEZCa0WY4PmYPdONVgL6huuiC8Bw",  // Your Web API Key
  projectId: "our-space-8b8cd",                      // Your Firebase Project ID
  storageBucket: "our-space-8b8cd.appspot.com",      // Your Firebase Storage Bucket
  messagingSenderId: "77403695391",                  // Firebase Project Number
  // appId and authDomain are typically not needed for React Native
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
