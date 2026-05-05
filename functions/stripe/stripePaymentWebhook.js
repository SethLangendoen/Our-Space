
// const Stripe = require("stripe");
// const admin = require("firebase-admin");

// if (!admin.apps.length) admin.initializeApp();

// async function handleStripePaymentWebhook(req, res) {
//   console.log("🔔 Stripe webhook received");

//   // stripe client must be created inside function
//   const stripe = new Stripe(process.env.STRIPE_SECRET);

//   let event;

//   try {
//     const sig = req.headers["stripe-signature"];
//     if (!sig) throw new Error("Missing Stripe signature");

//     event = stripe.webhooks.constructEvent(
//       req.rawBody,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );

//     console.log("✅ Webhook verified:", event.type);
//   } catch (err) {
//     console.error("❌ Signature verification failed:", err.message);
//     return res.status(400).json({ error: err.message });
//   }

//   const data = event.data.object;
//   const db = admin.firestore();

//   try {
//     switch (event.type) {

//       case "payment_intent.succeeded":
//       // case "charge.succeeded":
//       // case "transfer.created":
//       // case "application_fee.created":
//         console.log("💾 Writing transaction:", {
//           type: event.type,
//           stripeId: data.id,
//           amount: data.amount,
//         });

//         await db.collection("transactions").doc(data.id).set(
//           {
//             type: event.type,
//             stripeId: data.id,
//             reservationId: data.metadata?.reservationId || null,
//             amount: data.amount,
//             currency: data.currency,
//             metadata: data.metadata || {},
//             createdAt: admin.firestore.Timestamp.now(),
//           },
//           { merge: true }
//         );


//         const metadata = data.metadata || {};
//         const renterId = metadata.renterId;
//         const hostId = metadata.hostId;
//         const reservationId = metadata.reservationId;
//         const totalAmount = (data.amount / 100).toFixed(2);
//         const hostAmount = (Number(metadata.baseAmount || 0) / 100).toFixed(2);

//         if (renterId) {
//           await sendExpoPushNotification(
//             renterId,
//             "Payment Successful ✅",
//             `Your payment of $${totalAmount} CAD was processed successfully.`,
//             {
//               type: "payment_success",
//               reservationId,
//               stripeId: data.id,
//             }
//           );
//         }

//         if (hostId) {
//           await sendExpoPushNotification(
//             hostId,
//             "Payment Received 💸",
//             `You received $${hostAmount} CAD for a reservation.`,
//             {
//               type: "payment_received",
//               reservationId,
//               stripeId: data.id,
//             }
//           );
//         }






//         console.log("✅ Transaction saved:", data.id);
//         break;

//       default:
//         console.log("ℹ️ Ignored event:", event.type);
//     }

//     res.json({ received: true });
//   } catch (err) {
//     console.error("🔥 Firestore write failed:", err);
//     res.status(500).json({ error: err.message });
//   }
// }

// module.exports = { handleStripePaymentWebhook };



const Stripe = require("stripe");
const admin = require("firebase-admin");
const { sendExpoPushNotification } = require("../notifications/sendPaymentNotification");

if (!admin.apps.length) {
  admin.initializeApp();
}

async function handleStripePaymentWebhook(req, res) {
  console.log("🔔 Stripe webhook received");

  const stripe = new Stripe(process.env.STRIPE_SECRET);

  let event;

  try {
    const sig = req.headers["stripe-signature"];
    if (!sig) throw new Error("Missing Stripe signature");

    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Webhook verified:", event.type);
  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    return res.status(400).json({ error: err.message });
  }

  const data = event.data.object;
  const db = admin.firestore();

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("💾 Writing transaction:", {
          type: event.type,
          stripeId: data.id,
          amount: data.amount,
        });

        // Save transaction
        await db.collection("transactions").doc(data.id).set(
          {
            type: event.type,
            stripeId: data.id,
            reservationId: data.metadata?.reservationId || null,
            amount: data.amount,
            currency: data.currency,
            metadata: data.metadata || {},
            createdAt: admin.firestore.Timestamp.now(),
          },
          { merge: true }
        );

        // Extract metadata
        const metadata = data.metadata || {};
        const renterId = metadata.renterId;
        const hostId = metadata.hostId;
        const reservationId = metadata.reservationId;

        const totalAmount = (data.amount / 100).toFixed(2);
        const hostAmount = (
          Number(metadata.baseAmount || 0) / 100
        ).toFixed(2);

        // Notify renter
        if (renterId) {
          await sendExpoPushNotification(
            renterId,
            "Payment Successful ✅",
            `Your payment of $${totalAmount} CAD was processed successfully.`,
            {
              type: "payment_success",
              reservationId,
              stripeId: data.id,
            }
          );
        }

        // Notify host
        if (hostId) {
          await sendExpoPushNotification(
            hostId,
            "Payment Received 💸",
            `You received $${hostAmount} CAD for a reservation.`,
            {
              type: "payment_received",
              reservationId,
              stripeId: data.id,
            }
          );
        }

        console.log("✅ Transaction + notifications completed:", data.id);
        break;

      default:
        console.log("ℹ️ Ignored event:", event.type);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("🔥 Webhook processing failed:", err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { handleStripePaymentWebhook };