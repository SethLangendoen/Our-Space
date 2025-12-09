
// const admin = require("firebase-admin");
// const Stripe = require("stripe");

// let stripe;
// function getStripe() {
//   if (!stripe) {
//     const secret = process.env.STRIPE_SECRET;
//     if (!secret) throw new Error("Stripe secret not configured");
//     stripe = new Stripe(secret, { apiVersion: "2025-08-14" });
//   }
//   return stripe;
// }

// async function createStripeAccountLogic({ email, userId }) {
//   if (!email || !userId) {
//     throw new Error("Missing email or userId");
//   }

//   const stripe = getStripe();
//   const db = admin.firestore();

//   const userDoc = await db.collection("users").doc(userId).get();
//   if (userDoc.exists && userDoc.data().stripeAccountId) {
//     return { stripeAccountId: userDoc.data().stripeAccountId, message: "Already exists" };
//   }

//   const account = await stripe.accounts.create({
//     type: "express",
//     email,
//     capabilities: {
//       card_payments: { requested: true },
//       transfers: { requested: true },
//     },
//   });

//   await db.collection("users").doc(userId).update({
//     stripeAccountId: account.id,
//     stripeOnboardingComplete: false,
//   });

//   return { stripeAccountId: account.id };
// }

// module.exports = { createStripeAccountLogic };



// attempt at fixing the api version problem. 

const admin = require("firebase-admin");
const Stripe = require("stripe");

let stripe;
function getStripe() {
  if (!stripe) {
    const secret = process.env.STRIPE_SECRET;
    if (!secret) throw new Error("Stripe secret not configured");
    stripe = new Stripe(secret); // <-- NO API VERSION
  }
  return stripe;
}

async function createStripeAccountLogic({ email, userId }) {
  if (!email || !userId) {
    throw new Error("Missing email or userId");
  }

  const stripe = getStripe();
  const db = admin.firestore();

  const userDoc = await db.collection("users").doc(userId).get();
  if (userDoc.exists && userDoc.data().stripeAccountId) {
    return { stripeAccountId: userDoc.data().stripeAccountId, message: "Already exists" };
  }

  const account = await stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  await db.collection("users").doc(userId).update({
    stripeAccountId: account.id,
    stripeOnboardingComplete: false,
  });

  return { stripeAccountId: account.id };
}

module.exports = { createStripeAccountLogic };
