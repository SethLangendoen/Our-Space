const admin = require("firebase-admin");
const Stripe = require("stripe");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");

admin.initializeApp();

const db = admin.firestore();
let stripe;
function getStripe() {
  if (!stripe) {
    const secret = process.env.STRIPE_SECRET;
    if (!secret) throw new Error("Stripe secret not configured");
    stripe = new Stripe(secret); 
  }
  return stripe;
}

function calculateNextPaymentDate(from, frequency) {
  const next = new Date(from);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

async function processRecurringPaymentsLogic() {
  const now = admin.firestore.Timestamp.now();

  const reservationsSnap = await db
    .collection("reservations")
    .where("status", "==", "confirmed")
    .where("nextPaymentDate", "<=", now)
    .where("isProcessing", "==", false)
    .limit(20)
    .get();

  if (reservationsSnap.empty) {
    logger.info("No payments due");
    return;
  }

  const stripeClient = getStripe();

  for (const docSnap of reservationsSnap.docs) {
    const reservation = docSnap.data();
    const reservationId = docSnap.id;
    const PLATFORM_FEE_RATE = 0.095; // 9.5%

    try {
      await docSnap.ref.update({ isProcessing: true });

      const postSnap = await db.collection("spaces").doc(reservation.spaceId).get();
      if (!postSnap.exists) throw new Error("Post not found");

      const post = postSnap.data();

      const baseAmount = Math.round(Number(post.price) * 100);

      const renterFee = Math.round(baseAmount * PLATFORM_FEE_RATE);
      const hostFee = Math.round(baseAmount * PLATFORM_FEE_RATE);
      
      const amountChargedToRenter = baseAmount + renterFee;
      const applicationFee = hostFee + renterFee;
      


      const frequency = post.priceFrequency;
      const hostId = post.userId;

      const hostSnap = await db.collection("users").doc(hostId).get();
      const hostStripeId = hostSnap.data()?.stripe?.host?.accountId;
      if (!hostStripeId) throw new Error(`Host ${hostId} has no Stripe account`);

      const userSnap = await db.collection("users").doc(reservation.requesterId).get();
      const customerId = userSnap.data()?.stripe?.customer?.customerId;
      if (!customerId) throw new Error("Customer ID not found");

      const pmSnap = await db
        .collection("users")
        .doc(reservation.requesterId)
        .collection("paymentMethods")
        .where("isDefault", "==", true)
        .limit(1)
        .get();

      if (pmSnap.empty) throw new Error("No default payment method found");
      const paymentMethodId = pmSnap.docs[0].data().stripePaymentMethodId;


      await stripeClient.paymentIntents.create({
        amount: amountChargedToRenter,
        currency: "cad",
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
      
        transfer_data: {
          destination: hostStripeId,
        },
      
        application_fee_amount: applicationFee,
      
        metadata: {
          reservationId,
          renterId: reservation.requesterId,
          hostId,
      
          feeModel: "split_9_5_9_5",
          baseAmount: baseAmount.toString(),
          renterFee: renterFee.toString(),
          hostFee: hostFee.toString(),
          totalPlatformFee: (renterFee + hostFee).toString(),
        },
      });
      
      
      
      const nextPayment = calculateNextPaymentDate(new Date(), frequency);
      await docSnap.ref.update({
        lastPaymentDate: now,
        nextPaymentDate: admin.firestore.Timestamp.fromDate(nextPayment),
        isProcessing: false,
        updatedAt: now,
      });

      logger.info(`Payment successful for reservation: ${reservationId}`);
    } catch (err) {
      logger.error(`Payment failed for ${reservationId}: ${err.message}`);
      await docSnap.ref.update({ isProcessing: false });
    }
  }
}



const processRecurringPayments = onSchedule(
  { 
    schedule: "* * * * *", // Once an hour for right now. 
    timeZone: "America/Edmonton",
    secrets: ["STRIPE_SECRET"], // IMPORTANT: This injects the secret into process.env
    timeoutSeconds: 300 // Giving it 5 minutes to process the loop
  },
  async (event) => {
    // Wrap your logic here so the SDK handles the promise correctly
    await processRecurringPaymentsLogic();
  }
);

module.exports = { processRecurringPayments };

module.exports = { processRecurringPayments, processRecurringPaymentsLogic };

