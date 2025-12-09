



// const { https, setGlobalOptions } = require("firebase-functions/v2");
// const admin = require("firebase-admin");
// const { createStripeAccountLogic } = require("./stripe/createStripeAccount");
// const { createOnboardingLinkLogic } = require("./stripe/generateOnboardingLink");

// admin.initializeApp();

// setGlobalOptions({
//   memory: "512MB",
//   runtime: "nodejs22",
//   secrets: ["STRIPE_SECRET"],
// });

// exports.createStripeAccount = https.onRequest(async (req, res) => {
//   try {
//     if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

//     const idToken = req.headers.authorization?.split("Bearer ")[1];
//     if (!idToken) return res.status(401).send({ error: "Unauthorized" });

//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const userId = decodedToken.uid;
//     const { email } = req.body;

//     const result = await createStripeAccountLogic({ email, userId });
//     res.status(200).send(result);
//   } catch (err) {
//     console.error("Stripe function error:", err);
//     res.status(500).send({ error: err.message });
//   }
// });



// exports.createStripeOnboardingLink = https.onRequest(async (req, res) => {
// 	try {
// 	  if (req.method !== "POST") {
// 		return res.status(405).json({ error: "Method Not Allowed" });
// 	  }
  
// 	  const idToken = req.headers.authorization?.split("Bearer ")[1];
// 	  if (!idToken) return res.status(401).json({ error: "Unauthorized" });
  
// 	  const decoded = await admin.auth().verifyIdToken(idToken);
// 	  const result = await createOnboardingLinkLogic(decoded.uid);
  
// 	  return res.status(200).json(result);
  
// 	} catch (err) {
// 	  console.error(err);
// 	  return res.status(500).json({ error: err.message });
// 	}
//   });
  

// module.exports = { createOnboardingLinkLogic };


const { https, setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { createStripeAccountLogic } = require("./stripe/createStripeAccount");
const { createOnboardingLinkLogic } = require("./stripe/generateOnboardingLink");

admin.initializeApp();

setGlobalOptions({
  memory: "512MB",
  runtime: "nodejs22",
  secrets: ["STRIPE_SECRET"],
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
