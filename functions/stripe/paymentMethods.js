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

/**
 * Attaches a payment method to customer and stores it in Firestore
 */


 async function attachPaymentMethodLogic({ userId, paymentMethodId }) {
	if (!userId || !paymentMethodId) {
	  throw new Error("Missing userId or paymentMethodId");
	}
  
	const stripe = getStripe();
	const db = admin.firestore();
  
	const userRef = db.collection("users").doc(userId);
	const userSnap = await userRef.get();
  
	const customerId = userSnap.data()?.stripe?.customer?.customerId;
	if (!customerId) throw new Error("Stripe customer not found");
  
	// Fetch the payment method details from Stripe
	const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  
	// Determine if we need to set as default (first card)
	const defaultPM = userSnap.data()?.stripe?.customer?.defaultPaymentMethod;
	const isDefault = !defaultPM;
  
	// Store metadata in Firestore
	await userRef.collection("paymentMethods").doc(paymentMethodId).set({
	  stripePaymentMethodId: paymentMethodId,
	  brand: pm.card.brand,
	  last4: pm.card.last4,
	  expMonth: pm.card.exp_month,
	  expYear: pm.card.exp_year,
	  isDefault,
	  createdAt: admin.firestore.FieldValue.serverTimestamp(),
	});
  
	// If this is the first payment method, set as default in Stripe and Firestore
	if (isDefault) {
	  await stripe.customers.update(customerId, {
		invoice_settings: { default_payment_method: paymentMethodId },
	  });
  
	  await userRef.set(
		{
		  stripe: {
			customer: {
			  defaultPaymentMethod: paymentMethodId,
			  lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
			},
		  },
		},
		{ merge: true }
	  );
	}
  
	return { success: true };
  }

  

async function setDefaultPaymentMethodLogic({ userId, paymentMethodId }) {
	const stripe = getStripe();
	const db = admin.firestore();
  
	const userRef = db.collection("users").doc(userId);
	const userSnap = await userRef.get();
  
	const customerId = userSnap.data()?.stripe?.customer?.customerId;
	if (!customerId) throw new Error("Stripe customer not found");
  
	await stripe.customers.update(customerId, {
	  invoice_settings: {
		default_payment_method: paymentMethodId,
	  },
	});
  
	const batch = db.batch();
  
	const methodsSnap = await userRef.collection("paymentMethods").get();
	methodsSnap.forEach((doc) => {
	  batch.update(doc.ref, {
		isDefault: doc.id === paymentMethodId,
	  });
	});
  
	batch.set(
	  userRef,
	  {
		stripe: {
		  customer: {
			defaultPaymentMethod: paymentMethodId,
			lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
		  },
		},
	  },
	  { merge: true }
	);
  
	await batch.commit();
  
	return { success: true };
  }
  



  module.exports = {
	attachPaymentMethodLogic,
	setDefaultPaymentMethodLogic,
  };
  