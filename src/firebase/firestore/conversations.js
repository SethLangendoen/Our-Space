
/* 

/conversations/{conversationId}
/conversations/{conversationId}/messages/{messageId}

{
  participants: ['user1Uid', 'user2Uid'],
  lastMessage: "Hey there!",
  lastUpdated: Timestamp
}


*/ 


// firebase/firestore/conversations.js
import { db } from '../config';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';

// Create a new conversation between two users
export const createConversation = async (conversationId, participants) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  await setDoc(conversationRef, {
    participants,
    lastMessage: '',
    lastUpdated: serverTimestamp(),
  });
};

// Get a single conversation by ID
export const getConversation = async (conversationId) => {
  const docSnap = await getDoc(doc(db, 'conversations', conversationId));
  return docSnap.exists() ? docSnap.data() : null;
};

// Update the last message and timestamp
export const updateLastMessage = async (conversationId, message) => {
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: message,
    lastUpdated: serverTimestamp(),
  });
};

// Get all conversations involving a user
export const getUserConversations = async (uid) => {
  const q = query(collection(db, 'conversations'), where('participants', 'array-contains', uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
