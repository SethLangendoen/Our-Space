// const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
// const admin = require("firebase-admin");
// const fetch = require("node-fetch");

// if (!admin.apps.length) {
//   admin.initializeApp();
// }

// console.log("🔥 onReservationUpdated (Expo Push) file loaded");

// exports.onReservationUpdated = onDocumentUpdated(
//   "reservations/{reservationId}",
//   async (event) => {
//     try {
//       const beforeData = event.data?.before?.data();
//       const afterData = event.data?.after?.data();

//       if (!beforeData || !afterData) return;

//       // Detect meaningful reservation edits
//       const reservationChanged =
//         beforeData.startDate?.toMillis?.() !== afterData.startDate?.toMillis?.() ||
//         beforeData.endDate?.toMillis?.() !== afterData.endDate?.toMillis?.() ||
//         beforeData.description !== afterData.description ||
//         beforeData.frequency !== afterData.frequency ||
//         beforeData.storageDuration !== afterData.storageDuration;

//       // Only notify when reservation was updated and status reset
//       if (!reservationChanged || afterData.status !== "requested") {
//         return;
//       }

//       const hostId = afterData.hostId; // Assumes reservation stores hostId
//       const renterId = afterData.renterId; // Optional for message context

//       if (!hostId) {
//         console.log("No hostId found");
//         return;
//       }

//       console.log("Sending reservation update notification to host:", hostId);

//       // Get host user doc
//       const hostDoc = await admin
//         .firestore()
//         .collection("users")
//         .doc(hostId)
//         .get();

//       if (!hostDoc.exists) return;

//       const tokens = hostDoc.data().expoPushTokens || [];

//       if (!tokens.length) {
//         console.log("No Expo tokens found");
//         return;
//       }

//       // Filter valid Expo tokens
//       const validExpoTokens = tokens.filter((token) =>
//         token.startsWith("ExponentPushToken")
//       );

//       if (!validExpoTokens.length) return;

//       // Optional: fetch renter name
//       let renterName = "A user";

//       if (renterId) {
//         const renterDoc = await admin
//           .firestore()
//           .collection("users")
//           .doc(renterId)
//           .get();

//         if (renterDoc.exists) {
//           renterName = renterDoc.data().firstName || "A user";
//         }
//       }

//       // Build Expo messages
//       const messages = validExpoTokens.map((token) => ({
//         to: token,
//         sound: "default",
//         title: "Reservation Updated ✏️",
//         body: `${renterName} updated their reservation request.`,
//         data: {
//           reservationId: event.params.reservationId,
//           type: "reservation_update",
//         },
//       }));

//       // Send push notification
//       const response = await fetch("https://exp.host/--/api/v2/push/send", {
//         method: "POST",
//         headers: {
//           Accept: "application/json",
//           "Accept-encoding": "gzip, deflate",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(messages),
//       });

//       const result = await response.json();

//       console.log("Expo push response:", result);

//       // Clean invalid tokens
//       const tickets = result.data || [];
//       const workingTokens = [];

//       tickets.forEach((ticket, idx) => {
//         if (ticket.status === "ok") {
//           workingTokens.push(validExpoTokens[idx]);
//         } else {
//           console.log(
//             `Invalid Expo token removed: ${validExpoTokens[idx]}`,
//             ticket.details
//           );
//         }
//       });

//       if (workingTokens.length !== tokens.length) {
//         await admin
//           .firestore()
//           .collection("users")
//           .doc(hostId)
//           .update({
//             expoPushTokens: workingTokens,
//           });

//         console.log("Cleaned invalid Expo push tokens");
//       }
//     } catch (err) {
//       console.error("❌ Function error:", err);
//     }
//   }
// );

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

if (!admin.apps.length) {
  admin.initializeApp();
}

console.log("🔥 onReservationUpdated (Expo Push) file loaded");

exports.onReservationUpdated = onDocumentUpdated(
  "reservations/{reservationId}",
  async (event) => {
    try {
      const beforeData = event.data?.before?.data();
      const afterData = event.data?.after?.data();

      if (!beforeData || !afterData) return;

      // Detect meaningful reservation edits
      const reservationChanged =
        beforeData.startDate?.toMillis?.() !== afterData.startDate?.toMillis?.() ||
        beforeData.endDate?.toMillis?.() !== afterData.endDate?.toMillis?.() ||
        beforeData.description !== afterData.description ||
        beforeData.frequency !== afterData.frequency ||
        beforeData.storageDuration !== afterData.storageDuration;

      // Only notify if something important changed AND status reset to requested
      if (!reservationChanged || afterData.status !== "requested") {
        return;
      }

      // Your actual Firestore field names
      const hostId = afterData.ownerId;
      const renterId = afterData.requesterId;

      if (!hostId) {
        console.log("No ownerId found");
        return;
      }

      console.log("Sending reservation update notification to host:", hostId);

      // Get host user doc
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

      // Fetch requester name
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

      // Build Expo messages
      const messages = validExpoTokens.map((token) => ({
        to: token,
        sound: "default",
        title: "Reservation Updated ✏️",
        body: `${renterName} updated their request for ${afterData.spaceTitle}.`,
        data: {
          reservationId: event.params.reservationId,
          spaceId: afterData.spaceId,
          type: "reservation_update",
        },
      }));

      // Send push notifications
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
            `Invalid Expo token removed: ${validExpoTokens[idx]}`,
            ticket.details
          );
        }
      });

      // Update cleaned tokens if needed
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