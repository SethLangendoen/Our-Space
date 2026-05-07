

const { https } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// ✅ Firebase init (safe)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

let stripe;
function getStripe() {
  if (!stripe) {
    const secret = process.env.STRIPE_SECRET;
    if (!secret) throw new Error("Stripe secret not configured");
    stripe = new Stripe(secret);
  }
  return stripe;
}

// -----------------------------
// 🔥 Firestore Logging Helper
// -----------------------------
async function logOnboardingEvent(data) {
  try {
    await db.collection("onboardingLogs").add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to write onboarding log:", err);
  }
}

const ACCOUNT_EVENTS = new Set([
  "account.updated",
  "v2.core.account[requirements].updated",
  "v2.core.account[identity].updated",
]);

exports.handleStripeAccountUpdate = https.onRequest(
  {
    secrets: ["STRIPE_SECRET", "STRIPE_ACCOUNT_WEBHOOK_SECRET"],
    cors: false,
  },
  async (req, res) => {
    const stripeClient = getStripe();

    try {
      await logOnboardingEvent({
        stage: "webhook_received",
      });

      if (!req.rawBody) {
        await logOnboardingEvent({
          stage: "error",
          message: "Missing rawBody",
        });
        return res.status(400).send("Missing rawBody");
      }

      const sig = req.headers["stripe-signature"];
      if (!sig) {
        await logOnboardingEvent({
          stage: "error",
          message: "Missing Stripe signature",
        });
        return res.status(400).send("Missing Stripe signature");
      }

      let event;

      try {
        event = stripeClient.webhooks.constructEvent(
          req.rawBody,
          sig,
          process.env.STRIPE_ACCOUNT_WEBHOOK_SECRET
        );
      } catch (err) {
        await logOnboardingEvent({
          stage: "signature_failed",
          message: err.message,
        });

        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      await logOnboardingEvent({
        stage: "event_received",
        eventType: event.type,
      });

      if (!ACCOUNT_EVENTS.has(event.type)) {
        await logOnboardingEvent({
          stage: "ignored_event",
          eventType: event.type,
        });

        return res.status(200).json({ received: true });
      }

      const account = event.data.object;

      const chargesEnabled = !!account.charges_enabled;
      const payoutsEnabled = !!account.payouts_enabled;
      const onboardingComplete = chargesEnabled && payoutsEnabled;

      await logOnboardingEvent({
        stage: "account_parsed",
        accountId: account.id,
        chargesEnabled,
        payoutsEnabled,
        detailsSubmitted: account.details_submitted ?? false,
      });

      const snapshot = await db
        .collection("users")
        .where("stripe.host.accountId", "==", account.id)
        .get();

      await logOnboardingEvent({
        stage: "user_lookup",
        accountId: account.id,
        matchedUsers: snapshot.size,
      });

      if (snapshot.empty) {
        await logOnboardingEvent({
          stage: "warning",
          message: "No users found for account",
          accountId: account.id,
        });
      }

      const updates = snapshot.docs.map((doc) => {
        return doc.ref.update({
          "stripe.host.chargesEnabled": chargesEnabled,
          "stripe.host.payoutsEnabled": payoutsEnabled,
          "stripe.host.detailsSubmitted": account.details_submitted ?? false,
          "stripe.host.onboardingComplete": onboardingComplete,
          "stripe.host.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
        }).then(() => {
          return logOnboardingEvent({
            stage: "user_updated",
            userId: doc.id,
            accountId: account.id,
            onboardingComplete,
          });
        });
      });

      await Promise.all(updates);

      await logOnboardingEvent({
        stage: "completed",
        accountId: account.id,
        onboardingComplete,
      });

      return res.status(200).json({ received: true });

    } catch (err) {
      await logOnboardingEvent({
        stage: "fatal_error",
        message: err.message,
      });

      return res.status(500).send({ error: err.message });
    }
  }
);