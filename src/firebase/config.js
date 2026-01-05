
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBx5U9EEZCa0WY4PmYPdONVgL6huuiC8Bw",
  authDomain: "our-space-8b8cd.firebaseapp.com",
  projectId: "our-space-8b8cd",
  storageBucket: "our-space-8b8cd.appspot.com",
  messagingSenderId: "77403695391",
  appId: "1:77403695391:web:d7c3c7b90a9c7dd056682a",
  measurementId: "G-4G5NST5CTK"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app, 'gs://our-space-8b8cd.firebasestorage.app');
const functions = getFunctions(app, "us-central1"); 

export { auth, db, storage, functions };
