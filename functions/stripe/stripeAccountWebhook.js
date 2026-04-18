


const { https } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const Stripe = require("stripe");

let stripe;
function getStripe() {
  if (!stripe) {
    const secret = process.env.STRIPE_SECRET;
    if (!secret) throw new Error("Stripe secret not configured");
    stripe = new Stripe(secret);
  }
  return stripe;
}

const ACCOUNT_EVENTS = new Set([
  "v2.core.account.created",
  "v2.core.account.updated",
]);

exports.handleStripeAccountUpdate = https.onRequest(
  {
    secrets: ["STRIPE_SECRET", "STRIPE_ACCOUNT_WEBHOOK_SECRET"],
    cors: false,
    bodyParser: false,
  },
  async (req, res) => {
    try {
      console.log("Received Stripe webhook request");  // 🔹 log incoming request

      const stripe = getStripe();
      const sig = req.headers["stripe-signature"];
      if (!sig) {
        console.warn("Missing Stripe signature header");  // 🔹 log missing sig
        return res.status(400).send("Missing Stripe signature");
      }
      console.log("Incoming Stripe signature:", sig);
      console.log("Raw body length:", req.rawBody.length);
      console.log("Webhook secret env:", process.env.STRIPE_ACCOUNT_WEBHOOK_SECRET ? "set" : "NOT set");

      let event;
      try {
        
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          sig,
          process.env.STRIPE_ACCOUNT_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message); // 🔹 log sig failure
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log("Stripe event received:", event.type);  // 🔹 log event type

      if (!ACCOUNT_EVENTS.has(event.type)) {
        console.log("Event type not in ACCOUNT_EVENTS, ignoring:", event.type); // 🔹 log ignored events
        return res.status(200).json({ received: true });
      }

      const account = event.data.object;
      console.log("Account object received:", account.id);  // 🔹 log account ID

      const chargesEnabled = !!account.charges_enabled;
      const payoutsEnabled = !!account.payouts_enabled;
      const onboardingComplete = chargesEnabled && payoutsEnabled;

      const db = admin.firestore();
      const usersRef = db.collection("users");

      const snapshot = await usersRef
        .where("stripe.host.accountId", "==", account.id)
        .get();

      console.log("Matching users found:", snapshot.size); // 🔹 log how many users matched

      snapshot.forEach(doc => {
        console.log("Updating user:", doc.id);  // 🔹 log each document update
        doc.ref.update({
          "stripe.host.chargesEnabled": chargesEnabled,
          "stripe.host.payoutsEnabled": payoutsEnabled,
          "stripe.host.detailsSubmitted": account.details_submitted ?? false,
          "stripe.host.onboardingComplete": onboardingComplete,
          "stripe.host.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      console.log("Finished processing event:", event.type);  // 🔹 final log
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("Stripe webhook error:", err);
      return res.status(500).send({ error: err.message });
    }
  }
);