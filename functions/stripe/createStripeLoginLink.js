const admin = require("firebase-admin");
const Stripe = require("stripe");

let stripe;
function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET) {
      throw new Error("Stripe secret not configured");
    }

    stripe = new Stripe(process.env.STRIPE_SECRET);
  }

  return stripe;
}

async function createStripeLoginLinkLogic(userId) {
  const db = admin.firestore();

  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists || !userDoc.data()?.stripe?.host?.accountId) {
    throw new Error("Stripe account not found for this user");
  }

  const stripeAccountId = userDoc.data().stripe.host.accountId;

  const stripeClient = getStripe();

  const loginLink = await stripeClient.accounts.createLoginLink(
    stripeAccountId
  );

  return { url: loginLink.url };
}

module.exports = { createStripeLoginLinkLogic };