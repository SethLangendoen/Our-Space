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
    .get();

  if (reservationsSnap.empty) {
    logger.info("No payments due");
    return;
  }

  const stripeClient = getStripe();

  for (const docSnap of reservationsSnap.docs) {
    const reservation = docSnap.data();
    const reservationId = docSnap.id;
    const PLATFORM_FEE_RATE = 0.095; // 9.5% The bread and butter

    // const spaceSnap = await db.collection("spaces").doc(reservation.spaceId).get();
    // if (!spaceSnap.exists) throw new Error("Space not found");
    // const space = spaceSnap.data();
    // const location = space.location;



    try {
      await docSnap.ref.update({ isProcessing: true });

      // const postSnap = await db.collection("spaces").doc(reservation.spaceId).get();
      // if (!postSnap.exists) throw new Error("Post not found");
      if (!reservation.price || !reservation.pricePeriod) {
        throw new Error("Reservation missing price or pricePeriod");
      }

      // const post = postSnap.data();
      // const baseAmount = Math.round(Number(post.price) * 100);

      const spaceSnap = await db.collection("spaces").doc(reservation.spaceId).get();
      if (!spaceSnap.exists) throw new Error("Space not found");
      const space = spaceSnap.data();
      const location = space.location;
      const postalCode = location.postalCode || null;


      const baseAmount = Math.round(Number(reservation.price) * 100);
      const renterFee = Math.round(baseAmount * PLATFORM_FEE_RATE);
      const hostFee = Math.round(baseAmount * PLATFORM_FEE_RATE);



      const taxCalculation = await stripeClient.tax.calculations.create({
        currency: "cad",
        line_items: [
          { amount: renterFee, reference: "renter_fee", tax_code: "txcd_10103000" },
          { amount: hostFee, reference: "host_fee", tax_code: "txcd_10103000" }
        ],
        customer_details: {
          address: {
            line1: location.address,
            city: location.city,
            state: location.province,
            postal_code: postalCode,
            country: "CA",
          },
          address_source: "shipping",
        }
      });
      
      const lineItems = await stripeClient.tax.calculations.listLineItems(
        taxCalculation.id
      );
      
      const renterItem = lineItems.data.find(i => i.reference === "renter_fee");
      const renterTax = renterItem?.tax_amounts?.[0]?.amount || 0;
      
      const hostItem = lineItems.data.find(i => i.reference === "host_fee");
      const hostTax = hostItem?.tax_amounts?.[0]?.amount || 0;



      const amountChargedToRenter = baseAmount + renterFee + renterTax;
      const applicationFee = hostFee + renterFee + hostTax;

      // const frequency = post.priceFrequency;
      const frequency = reservation.pricePeriod;
      const hostId = reservation.ownerId;


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

      logger.info("Reservation info", {
        reservationId,
        location,
        postalCode,
        hostStripeId,
        customerId
      });

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
        
          baseAmount,
          renterFee,
          hostFee,
          renterTax,
          hostTax,
          taxProvince: location.province
        }
      });
      
      
      
      // const nextPayment = calculateNextPaymentDate(new Date(), frequency);
      const previousNextPayment = reservation.nextPaymentDate.toDate();
      const nextPayment = calculateNextPaymentDate(previousNextPayment, frequency);

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
    schedule: "*/5 * * * *",
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

