
const Stripe = require("stripe");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();

async function handleStripePaymentWebhook(req, res) {
  console.log("🔔 Stripe webhook received");

  // stripe client must be created inside function
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
      // case "charge.succeeded":
      // case "transfer.created":
      // case "application_fee.created":
        console.log("💾 Writing transaction:", {
          type: event.type,
          stripeId: data.id,
          amount: data.amount,
        });

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

        console.log("✅ Transaction saved:", data.id);
        break;

      default:
        console.log("ℹ️ Ignored event:", event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("🔥 Firestore write failed:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { handleStripePaymentWebhook };
