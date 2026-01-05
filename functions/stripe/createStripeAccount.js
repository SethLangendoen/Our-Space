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

async function createStripeAccountLogic({ email, userId }) {
  if (!email || !userId) throw new Error("Missing email or userId");

  const stripeClient = getStripe();
  const db = admin.firestore();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  // ✅ Prevent duplicate host accounts
  if (userDoc.exists && userDoc.data()?.stripe?.host?.accountId) {
    return {
      stripeAccountId: userDoc.data().stripe.host.accountId,
      message: "Already exists",
    };
  }

  // Create Stripe Express account
  const account = await stripeClient.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    business_profile: {
      url: "https://yourapp.com",
      mcc: "7399",
      name: "OurSpace",
    },
  });

  // ✅ Update Firestore: stripe.host
  await userRef.update({
    "stripe.host.accountId": account.id,
    "stripe.host.onboardingComplete": false,
    "stripe.host.chargesEnabled": false,
    "stripe.host.payoutsEnabled": false,
    "stripe.host.detailsSubmitted": false,
    "stripe.host.lastUpdated": admin.firestore.FieldValue.serverTimestamp(),
  });

  return { stripeAccountId: account.id };
}

module.exports = { createStripeAccountLogic };
