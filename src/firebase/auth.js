// import { auth } from './config';  // Directly import from config.js

// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// export const signUpWithEmail = async (email, password) => {
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
