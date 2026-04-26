


const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

console.log("🔥 onNewMessage file loaded");

exports.onNewMessage = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    try {
      const message = event.data?.data();
      if (!message) return;

      const { senderId, text } = message;
      if (!senderId || !text) return;

      const chatSnap = await admin
        .firestore()
        .doc(`chats/${event.params.chatId}`)
        .get();

      if (!chatSnap.exists) return;

      const users = chatSnap.data().users || [];
      const receiverId = users.find((u) => u !== senderId);

      if (!receiverId) return;
		console.log('I am here')
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(receiverId)
        .get();

      if (!userDoc.exists) return;

      const tokens = userDoc.data().expoPushTokens || [];
      if (!tokens.length) return;


	const validTokens = tokens.filter(Expo.isExpoPushToken);

	await expo.sendPushNotificationsAsync(
	validTokens.map(token => ({
		to: token,
		sound: "default",
		title: "New message 💬",
		body: text,
		data: { chatId: event.params.chatId },
	}))
	);

    } catch (err) {
      console.error("❌ Function error:", err);
    }
  }
);
