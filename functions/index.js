



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

exports.createStripeAccount = https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).send({ error: "Unauthorized" });

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { email } = req.body;

    const result = await createStripeAccountLogic({ email, userId });
    res.status(200).send(result);
  } catch (err) {
    console.error("Stripe function error:", err);
    res.status(500).send({ error: err.message });
  }
});


exports.createStripeOnboardingLink = https.onRequest(async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).send({ error: "Unauthorized" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const url = await createOnboardingLinkLogic(decoded.uid);

    res.status(200).send(url);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});
