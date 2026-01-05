const admin = require("firebase-admin");
const Stripe = require("stripe");

let stripe;
function getStripe() {
  if (!stripe) {
    const secret = process.env.STRIPE_SECRET;
    if (!secret) throw new Error("Stripe secret not configured");
    stripe = new Stripe(secret); // defaults to latest API version
  }
  return stripe;
}

/**
 * Ensure Stripe Customer exists for renter
 */
 async function ensureStripeCustomerLogic({ userId }) {
	if (!userId) throw new Error("Missing userId");
  
	const stripe = getStripe();
	const db = admin.firestore();
  
	const userRef = db.collection("users").doc(userId);
	const userSnap = await userRef.get();
  
	if (!userSnap.exists) {
	  throw new Error("User document not found");
	}
  
	const userData = userSnap.data();
	const existingCustomerId = userData?.stripe?.customer?.customerId;
  
	if (existingCustomerId) {
	  return { customerId: existingCustomerId };
	}
  
	const customer = await stripe.customers.create(
	  {
		email: userData?.email,
		metadata: { firebaseUID: userId },
	  },
	  {
		idempotencyKey: `customer_${userId}`,
	  }
	);
  
	await userRef.set(
	  {
		stripe: {
		  customer: {
			customerId: customer.id,
			livemode: customer.livemode,
			defaultPaymentMethod: null,
			lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
		  },
		},
	  },
	  { merge: true }
	);
  
	return { customerId: customer.id };
  }
  


async function createSetupIntentLogic({ userId }) {
	console.log("createSetupIntentLogic called for userId:", userId);
  
	if (!userId) throw new Error("Missing userId");
  
	const stripe = getStripe();
  
	// Ensure customer exists
	const { customerId } = await ensureStripeCustomerLogic({ userId });
	console.log("Stripe customerId:", customerId);
  
	if (!customerId) {
	  console.error("Stripe customer not found after ensureStripeCustomerLogic");
	  throw new Error("Stripe customer not found");
	}
  
	// Create SetupIntent
	const setupIntent = await stripe.setupIntents.create({
	  customer: customerId,
	  automatic_payment_methods: { enabled: true },
	});
	console.log("SetupIntent created:", setupIntent);
  
	if (!setupIntent?.client_secret) {
	  console.error("SetupIntent missing client_secret:", setupIntent);
	  throw new Error("Failed to create SetupIntent");
	}
  
	console.log("Returning clientSecret:", setupIntent.client_secret);
	return { clientSecret: setupIntent.client_secret };
  }
  
  module.exports = {
	ensureStripeCustomerLogic,
	createSetupIntentLogic,
  };
  