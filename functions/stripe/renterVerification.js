// Firebase function example
const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.createVerificationSession = async (req, res) => {
  const uid = req.body.uid;

  // Retrieve renter data
  const renterSnap = await admin.firestore().collection("users").doc(uid).get();
  const email = renterSnap.data().email;

  try {
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document", // document verification
      metadata: { uid },
      customer_email: email,
      // optionally, require additional info
      options: { document: { require_id_number: false } }
    });

    res.json({ clientSecret: verificationSession.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};