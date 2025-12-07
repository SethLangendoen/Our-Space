// posts are a subcollection of a user: users/{userId}/posts/{postId}

import { db } from '../config';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';


// create a post using a users id, and the post data inputted.
// this function will automatically add the createdAt field containing the current time of creation. 
export const createPost = async (userId, postData) => {
	try {
	  const postRef = doc(collection(db, 'users', userId, 'posts')); // no postId specified
	  await setDoc(postRef, {
		...postData,
		createdAt: serverTimestamp(), // add server timestamp
	  });
	  return postRef.id; // return the auto-generated post ID if needed
	} catch (error) {
	  console.error('Error creating post:', error);
	  throw error;
	}
  };


export const editPost = async (postId, updatedData) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, updatedData);
  } catch (error) {
    console.error("Error editing post:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
	try {
	  // Get the reference to the post document
	  const postRef = doc(db, 'posts', postId);
  
	  // Delete the post document
	  await deleteDoc(postRef);
  
	  console.log('Post deleted successfully');
	} catch (error) {
	  console.error('Error deleting post:', error);
	  throw error;
	}
  };


  export const addReservedTime = async (postId, startDate, endDate) => {
	try {
	  const spaceRef = doc(db, 'spaces', postId);
	  await updateDoc(spaceRef, {
		reservedTimes: arrayUnion({ start: startDate, end: endDate }),
	  });
	  console.log('Reserved time added successfully');
	} catch (err) {
	  console.error('Failed to add reserved time:', err);
	  throw err;
	}
  };
  