
import { db } from '../config';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc, updateDoc } from 'firebase/firestore';


// Create or update a user
// createdAt is only set when the particular document is created (recall a document is like a row in a table)
export const createUser = async (uid, data) => {
	try {
	  // Add the createdAt field with a server timestamp
	  await setDoc(doc(db, 'users', uid), {
		...data,
		createdAt: serverTimestamp(), // add the createdAt timestamp
	  });
	} catch (error) {
	  console.error("Error creating user:", error);
	  throw error;
	}
  };
 
// Get User data
export const getUser = async (uid) => {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
};

// Edit User
export const editUser = async (uid, newData) => {
	await updateDoc(doc(db, 'users', uid), newData);
  };
  
// Delete user
export const deleteUser = async (uid) => {
	await deleteDoc(doc(db, 'users', uid));
  };
  