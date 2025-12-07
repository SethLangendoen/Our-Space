

// // auth.js
// import { auth } from './config.js';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// // console.log("Firestore connected:", db);

// export const signUpWithEmail = async (email, password) => {
  
//   console.log('in here')

//   try {

//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);

//     return userCredential.user;
//   } catch (error) {
//     console.error("Sign up error:", error);
//     throw error;
//   }

// };

// export const loginWithEmail = async (email, password) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     return userCredential.user;
//   } catch (error) {
//     console.error("Login error:", error);
//     throw error;
//   }
// };

// export const logout = async () => {
//   try {
//     await signOut(auth);
//   } catch (error) {
//     console.error("Logout error:", error);
//     throw error;
//   }
// };



// firebaseAuth.js
import { auth } from './config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

// Email/Password Sign-Up
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await sendEmailVerification(user);
    await signOut(auth); // Optional: log out until email verified
    return user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Email/Password Login
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Google Sign-In (to be called from component)
export const signInWithGoogleCredential = async (idToken) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
};


