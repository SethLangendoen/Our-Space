/*

/conversations/{conversationId}
/conversations/{conversationId}/messages/{messageId}

{
  senderId: 'user1Uid',
  text: "Hey there!",
  timestamp: Timestamp,
  readBy: ['user1Uid'] // Optional, for read receipts
}

*/

// firebase/firestore/messages.js
import { db } from '../config';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';

// Add a message to a conversation
export const sendMessage = async (conversationId, senderId, text) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text,
    timestamp: serverTimestamp(),
  });
};

// Get all messages in a conversation, ordered by time
export const getMessages = async (conversationId) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
