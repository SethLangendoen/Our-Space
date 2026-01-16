

const { https, setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { createStripeAccountLogic } = require("./stripe/createStripeAccount");
const { createOnboardingLinkLogic } = require("./stripe/generateOnboardingLink");
const { isStripeAccountVerified } = require("./stripe/checkVerification");
const { handleStripeAccountUpdate } = require("./stripe/stripeAccountWebhook");
const { processRecurringPayments } = require('./payments/processRecurringPayments');
const { handleStripePaymentWebhook } = require("./stripe/stripePaymentWebhook");
const { cancelReservationEarly } = require("./payments/cancelReservationEarly");
const { getStripeEarningsLogic } = require("./stripe/getStripeEarningsLogic");


const {
  ensureStripeCustomerLogic,
  createSetupIntentLogic,
} = require("./stripe/renterCustomer");
const {
  attachPaymentMethodLogic,
  setDefaultPaymentMethodLogic,
} = require("./stripe/paymentMethods");

admin.initializeApp();

setGlobalOptions({
  memory: "512MB",
  runtime: "nodejs22",
  secrets: ["STRIPE_SECRET", "STRIPE_WEBHOOK_SECRET"],
});





// --- Create Stripe Account ---
exports.createStripeAccount = https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Missing email" });

    const result = await createStripeAccountLogic({ email, userId });
    return res.status(200).json(result);
  } catch (err) {
    console.error("Stripe function error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// --- Create Stripe Onboarding Link ---
exports.createStripeOnboardingLink = https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const result = await createOnboardingLinkLogic(decoded.uid);

    return res.status(200).json(result);
  } catch (err) {
    console.error("Stripe onboarding link error:", err);
    return res.status(500).json({ error: err.message });
  }
});


// checking verified user
exports.checkStripeVerification = https.onRequest(async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const verified = await isStripeAccountVerified(decoded.uid);

    res.status(200).json({ verified });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

exports.handleStripeAccountUpdate = handleStripeAccountUpdate;

exports.processRecurringPayments = processRecurringPayments;




// renter exports: 
exports.ensureStripeCustomer = https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(idToken);

    const result = await ensureStripeCustomerLogic({
      userId: decoded.uid,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("ensureStripeCustomer error:", err);
    res.status(500).json({ error: err.message });
  }
});



exports.createSetupIntent = https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(idToken);

    const result = await createSetupIntentLogic({
      userId: decoded.uid,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("createSetupIntent error:", err);
    res.status(500).json({ error: err.message });
  }
});


// paymentMethods functions for adding payment methods, and setting defaults: 

exports.attachPaymentMethod = https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: "Missing paymentMethodId" });
    }

    const result = await attachPaymentMethodLogic({
      userId: decoded.uid,
      paymentMethodId,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("attachPaymentMethod error:", err);
    res.status(500).json({ error: err.message });
  }
});


exports.setDefaultPaymentMethod = https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).json({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: "Missing paymentMethodId" });
    }

    const result = await setDefaultPaymentMethodLogic({
      userId: decoded.uid,
      paymentMethodId,
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("setDefaultPaymentMethod error:", err);
    res.status(500).json({ error: err.message });
  }
});

exports.handleStripePaymentWebhook = https.onRequest(
  {
    secrets: ["STRIPE_SECRET", "STRIPE_WEBHOOK_SECRET"],
  },
  handleStripePaymentWebhook
);

exports.cancelReservationEarly = cancelReservationEarly;


exports.getStripeEarnings = https.onRequest(
  { cors: true },   // optional but useful
  async (req, res) => {
    try {
      if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Authorization header" });
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decoded = await admin.auth().verifyIdToken(idToken);

      const earnings = await getStripeEarningsLogic({ userId: decoded.uid });
      return res.status(200).json(earnings);
    } catch (err) {
      console.error("getStripeEarnings error:", err);
      return res.status(500).json({ error: err.message });
    }
  }
);
