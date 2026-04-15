import {
  doc,
  getDocs,
  collection,
  query,
  orderBy,
  runTransaction,
} from 'firebase/firestore';
import { db } from 'src/firebase/config';

export const updateFirstResponseTime = async (
  chatId: string,
  senderId: string
) => {
  try {
    console.log('--- updateFirstResponseTime START ---');
    console.log('chatId:', chatId);
    console.log('senderId:', senderId);

    const messagesRef = collection(db, 'chats', chatId, 'messages');

    const messagesSnapshot = await getDocs(
      query(messagesRef, orderBy('createdAt', 'asc'))
    );

    console.log('Messages fetched:', messagesSnapshot.size);

    if (messagesSnapshot.empty) {
      console.log('EXIT: No messages found');
      return;
    }

    // Filter out unresolved timestamps
    const validDocs = messagesSnapshot.docs.filter(
      (doc) => doc.data().createdAt?.seconds
    );

    console.log(
      'Valid timestamp messages:',
      validDocs.map((d) => ({
        id: d.id,
        senderId: d.data().senderId,
        text: d.data().text,
        createdAt: d.data().createdAt?.seconds,
        firstResponseRecorded: d.data().firstResponseRecorded,
      }))
    );

    // First message from OTHER user
    const firstMessage = validDocs.find(
      (doc) => doc.data().senderId !== senderId
    );

    if (!firstMessage) {
      console.log('EXIT: No first message from other user found');
      return;
    }

    console.log('First message found:', {
      id: firstMessage.id,
      senderId: firstMessage.data().senderId,
      createdAt: firstMessage.data().createdAt.seconds,
    });

    // First response from current user after that
    const firstResponse = validDocs.find(
      (doc) =>
        doc.data().senderId === senderId &&
        doc.data().createdAt.seconds >
          firstMessage.data().createdAt.seconds
    );

    if (!firstResponse) {
      console.log('EXIT: No first response found from sender');
      return;
    }

    console.log('First response found:', {
      id: firstResponse.id,
      createdAt: firstResponse.data().createdAt.seconds,
      firstResponseRecorded: firstResponse.data().firstResponseRecorded,
    });

    if (firstResponse.data().firstResponseRecorded) {
      console.log('EXIT: First response already recorded');
      return;
    }

    const responseTime =
      firstResponse.data().createdAt.seconds -
      firstMessage.data().createdAt.seconds;

    console.log('Response time (seconds):', responseTime);

    const userRef = doc(db, 'users', senderId);

    await runTransaction(db, async (transaction) => {
      console.log('Running transaction...');

      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists()) {
        console.log('EXIT: User doc not found');
        return;
      }

      const data = userDoc.data();

      const totalFirstResponses =
        (data.responseStats?.totalFirstResponses || 0) + 1;

      const totalFirstResponseTime =
        (data.responseStats?.totalFirstResponseTime || 0) + responseTime;

      const averageFirstResponseTime =
        totalFirstResponseTime / totalFirstResponses;

      const speedyReplier =
        totalFirstResponses >= 1 &&
        averageFirstResponseTime <= 3600;

      console.log('Updating user stats:', {
        totalFirstResponses,
        totalFirstResponseTime,
        averageFirstResponseTime,
        speedyReplier,
      });

      transaction.update(userRef, {
        responseStats: {
          totalFirstResponses,
          totalFirstResponseTime,
          averageFirstResponseTime,
        },
        'badges.speedyReplier': speedyReplier,
      });

      const firstResponseDocRef = doc(
        db,
        'chats',
        chatId,
        'messages',
        firstResponse.id
      );

      transaction.update(firstResponseDocRef, {
        firstResponseRecorded: true,
      });

      console.log('Marked first response as recorded');
    });

    console.log('--- updateFirstResponseTime SUCCESS ---');
  } catch (err) {
    console.error('updateFirstResponseTime ERROR:', err);
  }
};