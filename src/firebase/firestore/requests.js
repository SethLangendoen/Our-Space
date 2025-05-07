/* 

posts/{postId}/requests/{requestId}

{
  "requesterId": "user456",
  "ownerId": "user123", // (post owner)
  "postId": "abc123",
  "conversationId": "xyz789", // optional, useful for linking
  "moveInDate": "2025-06-01",
  "moveOutDate": "2025-08-15",
  "priceOffered": 250,
  "status": "pending", // "accepted", "declined"
  "createdAt": Timestamp
}

*/ 


import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

// Create a new booking request with auto-generated requestId
export const createRequest = async (postId, data) => {
  const requestsCollectionRef = collection(db, 'posts', postId, 'requests');
  const newRequestRef = doc(requestsCollectionRef); // auto-generates an ID
  const requestId = newRequestRef.id;

  await setDoc(newRequestRef, {
    ...data,
    createdAt: serverTimestamp(),
    status: 'pending',
    requestId, // optional but helpful to store the ID inside the document
  });

  return requestId;
};

// Update request status (accepted, declined)
export const updateRequestStatus = async (postId, requestId, newStatus) => {
  const requestRef = doc(db, 'posts', postId, 'requests', requestId);
  await updateDoc(requestRef, {
    status: newStatus,
  });
};

// Delete a booking request
export const deleteRequest = async (postId, requestId) => {
  const requestRef = doc(db, 'posts', postId, 'requests', requestId);
  await deleteDoc(requestRef);
};
