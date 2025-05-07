
/* NOTES 
- Firestore automatically creates collections when no document of the type exists yet. 
- Subcollections are used to associate objects to other objects. For example a user will have posts references etc. 
- Firestore does not require a full schema, you can add or change fields at any time. 

- Firebase auth fields: (these are all accessible using auth().currentUser)
	- uid
	- email
	- emailverified
	- phonenumber
	- displayname
	- photoURL
	- providerData
	- created at / last login at
	
- Firebase Metadata I define for profile stuff
	- firstname
	- lastname
	- username
	- profilepicture
	- bio
	- location, preferences etc
	- email (optional)
	- last online
	- created at (so you can see a post and see 'member since ...')

- Is it ever worth duplicating the fields like email? 
	- yes, so you don't have to call auth all the time. 
	- firestore let's you structure and query data more freely than auth 

*/
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
  