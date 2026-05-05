const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

if (!admin.apps.length) {
  admin.initializeApp();
}

console.log("🔥 onReservationEndDateRequested (Expo Push) file loaded");

exports.onReservationEndDateRequested = onDocumentUpdated(
  "reservations/{reservationId}",
  async (event) => {
    try {
      const beforeData = event.data?.before?.data();
      const afterData = event.data?.after?.data();

      if (!beforeData || !afterData) return;

      // Only trigger when a NEW endDateChangeRequest is added or changed
      const beforeEndDateRequest = beforeData.endDateChangeRequest?.toMillis?.() || null;
      const afterEndDateRequest = afterData.endDateChangeRequest?.toMillis?.() || null;

      if (
        !afterEndDateRequest ||
        beforeEndDateRequest === afterEndDateRequest
      ) {
        return;
      }

      const hostId = afterData.ownerId;
      const renterId = afterData.requesterId;

      if (!hostId) {
        console.log("No ownerId found");
        return;
      }

      console.log(
        "Sending end date change request notification to host:",
        hostId
      );

      // Get host user document
      const hostDoc = await admin
        .firestore()
        .collection("users")
        .doc(hostId)
        .get();

      if (!hostDoc.exists) {
        console.log("Host user not found");
        return;
      }

      const tokens = hostDoc.data().expoPushTokens || [];

      if (!tokens.length) {
        console.log("No Expo tokens found");
        return;
      }

      // Filter valid Expo tokens
      const validExpoTokens = tokens.filter(
        (token) =>
          typeof token === "string" &&
          token.startsWith("ExponentPushToken")
      );

      if (!validExpoTokens.length) {
        console.log("No valid Expo tokens");
        return;
      }

      // Get requester name
      let renterName = "A user";

      if (renterId) {
        const renterDoc = await admin
          .firestore()
          .collection("users")
          .doc(renterId)
          .get();

        if (renterDoc.exists) {
          const renterData = renterDoc.data();
          renterName =
            renterData.firstName ||
            renterData.displayName ||
            renterData.name ||
            "A user";
        }
      }

      // Format requested end date
      const requestedEndDate = new Date(afterEndDateRequest).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      // Build Expo messages
      const messages = validExpoTokens.map((token) => ({
        to: token,
        sound: "default",
        title: "End Date Change Requested 📅",
        body: `${renterName} requested a new reservation end date (${requestedEndDate}) for ${afterData.spaceTitle}.`,
        data: {
          reservationId: event.params.reservationId,
          spaceId: afterData.spaceId,
          type: "reservation_end_date_request",
        },
      }));

      // Send notifications
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

      // Remove invalid tokens
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

      // Save cleaned token list
      if (workingTokens.length !== tokens.length) {
        await admin
          .firestore()
          .collection("users")
          .doc(hostId)
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