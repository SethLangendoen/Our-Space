import { doc, getDocs, collection, query, orderBy, runTransaction } from 'firebase/firestore';
import { db } from 'src/firebase/config';

const updateFirstResponseTime = async (chatId: string, senderId: string) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const messagesSnapshot = await getDocs(query(messagesRef, orderBy('createdAt', 'asc')));

  if (messagesSnapshot.empty) return;

  // first message from OTHER user
  const firstMessage = messagesSnapshot.docs.find(
    (doc) => doc.data().senderId !== senderId
  );
  if (!firstMessage) return;

  // first message from current user after that
  const firstResponse = messagesSnapshot.docs.find(
    (doc) =>
      doc.data().senderId === senderId &&
      doc.data().createdAt?.seconds > firstMessage.data().createdAt.seconds
  );
  if (!firstResponse || firstResponse.data().firstResponseRecorded) return;

  const responseTime = firstResponse.data().createdAt.seconds - firstMessage.data().createdAt.seconds;

  const userRef = doc(db, 'users', senderId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) return;

    const data = userDoc.data();
    const totalFirstResponses = (data.responseStats?.totalFirstResponses || 0) + 1;
    const totalFirstResponseTime = (data.responseStats?.totalFirstResponseTime || 0) + responseTime;
    const averageFirstResponseTime = totalFirstResponseTime / totalFirstResponses;

    transaction.update(userRef, {
      responseStats: {
        totalFirstResponses,
        totalFirstResponseTime,
        averageFirstResponseTime,
      },
    });

    // mark the message so we don't double-count
    const firstResponseDocRef = doc(db, 'chats', chatId, 'messages', firstResponse.id);
    transaction.update(firstResponseDocRef, { firstResponseRecorded: true });
  });
};