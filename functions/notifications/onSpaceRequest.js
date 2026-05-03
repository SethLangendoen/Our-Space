// notifications/onSpaceRequest.js

const {
	onDocumentCreated,
	onDocumentUpdated,
  } = require("firebase-functions/v2/firestore");
  const admin = require("firebase-admin");
  const fetch = require("node-fetch");
  
  if (!admin.apps.length) {
	admin.initializeApp();
  }
  
  console.log("🔥 Space request notification functions loaded");
  
  /**
   * Helper: Send Expo Push Notification
  */

  async function sendExpoPushNotification(userId, title, body, data = {}) {
	try {
	  const userDoc = await admin
		.firestore()
		.collection("users")
		.doc(userId)
		.get();
  
	  if (!userDoc.exists) {
		console.log(`User ${userId} not found`);
		return;
	  }
  
	  const tokens = userDoc.data().expoPushTokens || [];
  
	  if (!tokens.length) {
		console.log(`No Expo tokens for user ${userId}`);
		return;
	  }
  
	  const validExpoTokens = tokens.filter(
		(token) =>
		  typeof token === "string" &&
		  token.startsWith("ExponentPushToken")
	  );
  
	  if (!validExpoTokens.length) {
		console.log(`No valid Expo tokens for user ${userId}`);
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
  
	  console.log("Expo push response:", result);
  
	  // Clean invalid tokens
	  const tickets = result.data || [];
	  const workingTokens = [];
  
	  tickets.forEach((ticket, idx) => {
		if (ticket.status === "ok") {
		  workingTokens.push(validExpoTokens[idx]);
		} else {
		  console.log(
			`Removing invalid token for user ${userId}:`,
			validExpoTokens[idx]
		  );
		}
	  });
  
	  if (workingTokens.length !== tokens.length) {
		await admin
		  .firestore()
		  .collection("users")
		  .doc(userId)
		  .update({
			expoPushTokens: workingTokens,
		  });
  
		console.log(`Cleaned invalid tokens for user ${userId}`);
	  }
	} catch (err) {
	  console.error("Push send error:", err);
	}
  }
  
  /**
   * 1. NEW SPACE REQUEST CREATED
   * requested → notify host
   */

  exports.onSpaceRequestCreated = onDocumentCreated(
	"reservations/{requestId}",
	async (event) => {
	  try {
		const request = event.data?.data();
		if (!request) return;
  
		if (request.status !== "requested") return;
  
		const {
		  ownerId,
		  requesterId,
		  spaceTitle,
		} = request;
  
		if (!ownerId || !requesterId) return;
  
		// Get requester name
		const requesterDoc = await admin
		  .firestore()
		  .collection("users")
		  .doc(requesterId)
		  .get();
  
		const requesterName = requesterDoc.exists
		  ? `${requesterDoc.data().firstName || "Someone"}`
		  : "Someone";
  
		await sendExpoPushNotification(
		  ownerId,
		  "New space request 📦",
		  `${requesterName} requested to rent your space: ${spaceTitle}`,
		  {
			type: "space_request",
			requestId: event.params.requestId,
			spaceId: request.spaceId,
		  }
		);
  
		console.log("Host notified of new request");
	  } catch (err) {
		console.error("❌ onSpaceRequestCreated error:", err);
	  }
	}
  );
  
  /**
   * 2. STATUS CHANGES
   */
  exports.onSpaceRequestUpdated = onDocumentUpdated(
	"reservations/{requestId}",
	async (event) => {
	  try {
		const before = event.data.before.data();
		const after = event.data.after.data();
  
		if (!before || !after) return;
  
		const oldStatus = before.status;
		const newStatus = after.status;
  
		if (oldStatus === newStatus) return;
  
		/**
		 * requested → awaiting_acceptance
		 * Notify renter that host accepted
		 */
		if (
		  oldStatus === "requested" &&
		  newStatus === "awaiting_acceptance"
		) {
		  await sendExpoPushNotification(
			after.requesterId,
			"Request accepted 🎉",
			`Your request for ${after.spaceTitle} has been accepted by the host.`,
			{
			  type: "space_request_accepted",
			  requestId: event.params.requestId,
			  spaceId: after.spaceId,
			}
		  );
  
		  console.log("Renter notified of acceptance");
		}
  
		/**
		 * awaiting_acceptance → confirmed
		 * Notify host that renter confirmed
		 */
		if (
		  oldStatus === "awaiting_acceptance" &&
		  newStatus === "confirmed"
		) {
		  await sendExpoPushNotification(
			after.ownerId,
			"Booking confirmed ✅",
			`${after.spaceTitle} has officially been confirmed by the renter.`,
			{
			  type: "space_request_confirmed",
			  requestId: event.params.requestId,
			  spaceId: after.spaceId,
			}
		  );
  
		  console.log("Host notified of final confirmation");
		}
	  } catch (err) {
		console.error("❌ onSpaceRequestUpdated error:", err);
	  }
	}
  );

