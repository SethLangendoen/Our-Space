

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

console.log("🔥 onNewMessage (Expo Push) file loaded");

exports.onNewMessage = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    try {
      const message = event.data?.data();
      if (!message) return;

      const { senderId, text } = message;
      if (!senderId || !text) return;

      // Get chat doc
      const chatSnap = await admin
        .firestore()
        .doc(`chats/${event.params.chatId}`)
        .get();

      if (!chatSnap.exists) return;

      const users = chatSnap.data().users || [];

      // Assumes 1-to-1 chat
      const receiverId = users.find((u) => u !== senderId);
      if (!receiverId) return;

      console.log("Sending Expo push notification to:", receiverId);

      // Get receiver user doc
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(receiverId)
        .get();

      if (!userDoc.exists) return;

      const tokens = userDoc.data().expoPushTokens || [];
      if (!tokens.length) {
        console.log("No Expo tokens found");
        return;
      }

      console.log("Expo tokens found:", tokens.length);

      // Filter valid Expo tokens
      const validExpoTokens = tokens.filter((token) =>
        token.startsWith("ExponentPushToken")
      );

      if (!validExpoTokens.length) return;

      // Build Expo messages
      const messages = validExpoTokens.map((token) => ({
        to: token,
        sound: "default",
        title: "New message 💬",
        body: text,
        data: {
          chatId: event.params.chatId,
        },
      }));

      // Send to Expo Push API
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();

      console.log("Expo push response:", result);

      // Clean invalid tokens
      const tickets = result.data || [];
      const workingTokens = [];

      tickets.forEach((ticket, idx) => {
        if (ticket.status === "ok") {
          workingTokens.push(validExpoTokens[idx]);
        } else {
          console.log(
            `Invalid Expo token removed: ${validExpoTokens[idx]}`,
            ticket.details
          );
        }
      });

      if (workingTokens.length !== tokens.length) {
        await admin
          .firestore()
          .collection("users")
          .doc(receiverId)
          .update({
            expoPushTokens: workingTokens,
          });

        console.log("Cleaned invalid Expo push tokens");
      }
    } catch (err) {
      console.error("❌ Function error:", err);
    }
  }
);