
const admin = require("firebase-admin");
const Stripe = require("stripe");

let stripe;
function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET) throw new Error("Stripe secret not configured");
    stripe = new Stripe(process.env.STRIPE_SECRET);
  }
  return stripe;
}

async function createOnboardingLinkLogic(userId) {
  const db = admin.firestore();
  const user = await db.collection("users").doc(userId).get();

  if (!user.exists || !user.data().stripe?.host?.accountId) {
    throw new Error("Stripe account not found for this user");
  }
  
  const stripeAccountId = user.data().stripe.host.accountId;
  
  const stripe = getStripe();

  const link = await stripe.accountLinks.create({
    account: stripeAccountId,
    type: "account_onboarding",
    refresh_url: "https://yourapp.com/return",
    return_url: "https://yourapp.com/return",
  });


  // this link will prefill their business type, and website: 

  



  return { url: link.url };
}

module.exports = { createOnboardingLinkLogic };
