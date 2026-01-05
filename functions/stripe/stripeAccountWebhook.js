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

const ACCOUNT_V2_EVENTS = new Set([
  "v2.core.account.created",
  "v2.core.account.updated",
  "v2.core.account[requirements].updated",
  "v2.core.account[configuration.merchant].capability_status_updated",
  "v2.core.account[configuration.customer].capability_status_updated",
  "v2.core.account[configuration.recipient].capability_status_updated",
]);

exports.handleStripeAccountUpdate = https.onRequest(
  {
    secrets: ["STRIPE_SECRET", "STRIPE_WEBHOOK_SECRET"],
    cors: false,
    bodyParser: false,
  },
  async (req, res) => {
    try {
      const stripe = getStripe();
      const sig = req.headers["stripe-signature"];
      if (!sig) return res.status(400).send("Missing Stripe signature");

      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (!ACCOUNT_V2_EVENTS.has(event.type)) {
        return res.status(200).json({ received: true });
      }

      const account = event.data.object;

      const chargesEnabled = !!account.charges_enabled;
      const payoutsEnabled = !!account.payouts_enabled;

      // 🔑 onboardingComplete now only depends on charges + payouts
      const onboardingComplete = chargesEnabled && payoutsEnabled;

      const db = admin.firestore();
      const usersRef = db.collection("users");

      // ✅ Query the top-level stripe.host object
      const snapshot = await usersRef
        .where("stripe.host.accountId", "==", account.id)
        .get();

      snapshot.forEach(doc => {
        doc.ref.update({
          "stripe.host.chargesEnabled": chargesEnabled,
          "stripe.host.payoutsEnabled": payoutsEnabled,
          "stripe.host.detailsSubmitted": account.details_submitted ?? false,
          "stripe.host.onboardingComplete": onboardingComplete,
          "stripe.host.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("Stripe webhook error:", err);
      return res.status(500).send({ error: err.message });
    }
  }
);
