// const { Expo } = require("expo-server-sdk");
// const admin = require("firebase-admin");

// const expo = new Expo();

// exports.sendPushNotificationLogic = async ({ userId, title, body, data }) => {
//   // 1. Get user push tokens
//   const userDoc = await admin.firestore().collection("users").doc(userId).get();

//   if (!userDoc.exists) {
//     throw new Error("User not found");
//   }

//   const tokens = userDoc.data().expoPushTokens || [];

//   if (!tokens.length) {
//     console.log("No push tokens for user");
//     return { success: false };
//   }

//   // 2. Build messages
//   const messages = tokens
//     .filter(token => Expo.isExpoPushToken(token))
//     .map(token => ({
//       to: token,
//       sound: "default",
//       title,
//       body,
//       data: data || {},
//     }));

//   // 3. Send notifications
//   const chunks = expo.chunkPushNotifications(messages);
//   const tickets = [];

//   for (let chunk of chunks) {
//     const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//     tickets.push(...ticketChunk);
//   }

//   return { success: true, tickets };
// };