



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';  // Initialize Auth directly here
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx5U9EEZCa0WY4PmYPdONVgL6huuiC8Bw",
  authDomain: "our-space-8b8cd.firebaseapp.com",
  projectId: "our-space-8b8cd",
  storageBucket: "our-space-8b8cd.firebasestorage.app",
  messagingSenderId: "77403695391",
  appId: "1:77403695391:web:d7c3c7b90a9c7dd056682a",
  measurementId: "G-4G5NST5CTK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
