const admin = require("firebase-admin");

async function isStripeAccountVerified(userId) {
  const db = admin.firestore();
  const userDoc = await db.collection("users").doc(userId).get();

  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const hostStripe = userDoc.data()?.stripe?.host;

  if (!hostStripe?.accountId) {
    throw new Error("Stripe host account not found");
  }

  
  // ✅ Only check the flags that still exist
  return hostStripe.chargesEnabled === true && hostStripe.payoutsEnabled === true;
}

module.exports = { isStripeAccountVerified };
