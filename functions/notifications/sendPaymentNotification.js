// notifications/sendPaymentNotification.js

const admin = require("firebase-admin");
const fetch = require("node-fetch");

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Send Expo push notification to a user
 * @param {string} userId - Firestore user ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional payload
 */
async function sendExpoPushNotification(userId, title, body, data = {}) {
  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      console.log(`⚠️ User not found: ${userId}`);
      return;
    }

    const tokens = userDoc.data().expoPushTokens || [];

    if (!tokens.length) {
      console.log(`⚠️ No Expo tokens for user: ${userId}`);
      return;
    }

    // Filter valid Expo tokens
    const validExpoTokens = tokens.filter(
      (token) =>
        typeof token === "string" &&
        token.startsWith("ExponentPushToken")
    );

    if (!validExpoTokens.length) {
      console.log(`⚠️ No valid Expo tokens for user: ${userId}`);
      return;
    }

    const messages = validExpoTokens.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data,
    }));

    const response = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      }
    );

    const result = await response.json();

    console.log("📨 Expo payment push response:", result);

    // Clean invalid tokens
    const tickets = result.data || [];
    const workingTokens = [];

    tickets.forEach((ticket, idx) => {
      if (ticket.status === "ok") {
        workingTokens.push(validExpoTokens[idx]);
      } else {
        console.log(
          `❌ Removing invalid Expo token: ${validExpoTokens[idx]}`,
          ticket.details
        );
      }
    });

    // Update Firestore if tokens changed
    if (workingTokens.length !== tokens.length) {
      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({
          expoPushTokens: workingTokens,
        });

      console.log(`🧹 Cleaned invalid Expo tokens for user: ${userId}`);
    }
  } catch (err) {
    console.error("🔥 Payment notification error:", err);
  }
}

module.exports = { sendExpoPushNotification };