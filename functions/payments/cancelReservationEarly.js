// const { onCall, HttpsError } = require("firebase-functions/v2/https");
// const admin = require("firebase-admin");
// const Stripe = require("stripe");

// const db = admin.firestore();

// let stripe;
// function getStripe() {
//   if (!stripe) {
//     if (!process.env.STRIPE_SECRET) {
//       throw new HttpsError(
//         "internal",
//         "Stripe configuration is missing"
//       );
//     }
//     stripe = new Stripe(process.env.STRIPE_SECRET);
//   }
//   return stripe;
// }

// function calculateCancellationBaseAmount(reservation, space) {
//   const now = new Date();
//   const start = reservation.startDate.toDate();
//   const hoursBeforeStart = (start - now) / (1000 * 60 * 60);

//   const baseAmount = Math.round(Number(reservation.price) * 100);

//   if (hoursBeforeStart >= 168) return 0;        // 7+ days
//   if (hoursBeforeStart >= 48) return Math.round(baseAmount * 0.25);

//   return Math.round(baseAmount * 0.5);          // <48h
// }

// exports.cancelReservationEarly = onCall(
//   { secrets: ["STRIPE_SECRET"] },
//   async (request) => {
//     const uid = request.auth?.uid;
//     if (!uid) {
//       throw new HttpsError(
//         "unauthenticated",
//         "You must be logged in to cancel a reservation"
//       );
//     }

//     const { reservationId } = request.data || {};
//     if (!reservationId) {
//       throw new HttpsError(
//         "invalid-argument",
//         "Reservation ID is required"
//       );
//     }

//     const now = admin.firestore.Timestamp.now();

//     const reservationRef = db.collection("reservations").doc(reservationId);
//     const reservationSnap = await reservationRef.get();

//     if (!reservationSnap.exists) {
//       throw new HttpsError("not-found", "Reservation does not exist");
//     }

//     const reservation = reservationSnap.data();

//     if (reservation.requesterId !== uid) {
//       throw new HttpsError(
//         "permission-denied",
//         "You do not have permission to cancel this reservation"
//       );
//     }

//     if (reservation.status !== "confirmed") {
//       throw new HttpsError(
//         "failed-precondition",
//         "Only confirmed reservations can be cancelled"
//       );
//     }

//     if (reservation.startDate.toDate() <= new Date()) {
//       throw new HttpsError(
//         "failed-precondition",
//         "This reservation has already started"
//       );
//     }

//     const spaceSnap = await db.collection("spaces").doc(reservation.spaceId).get();
//     if (!spaceSnap.exists) {
//       throw new HttpsError(
//         "not-found",
//         "Associated space could not be found"
//       );
//     }

//     const space = spaceSnap.data();

//     const cancellationBase = calculateCancellationBaseAmount(reservation, space);

//     let paymentIntentId = null;

//     const PLATFORM_FEE_RATE = 0.095;

//     const renterFee = Math.round(cancellationBase * PLATFORM_FEE_RATE);
//     const hostFee = Math.round(cancellationBase * PLATFORM_FEE_RATE);

//     const amountChargedToRenter = cancellationBase + renterFee;
//     const applicationFee = renterFee + hostFee;
//     const hostPayout = cancellationBase - hostFee;

//     if (cancellationBase > 0) {
//       const stripeClient = getStripe();

//       // Use the stored default payment method directly
//       const renterSnap = await db.collection("users").doc(uid).get();
//       const customerData = renterSnap.data()?.stripe?.customer;
//       const customerId = customerData?.customerId;
//       const paymentMethodId = customerData?.defaultPaymentMethod;

//       if (!customerId || !paymentMethodId) {
//         throw new HttpsError(
//           "failed-precondition",
//           "Customer or default payment method not found"
//         );
//       }

//       const hostSnap = await db.collection("users").doc(space.userId).get();
//       const hostStripeId = hostSnap.data()?.stripe?.host?.accountId;

//       if (!hostStripeId) {
//         throw new HttpsError(
//           "failed-precondition",
//           "Host is not eligible to receive payments"
//         );
//       }


//       try {

//         const pi = await stripeClient.paymentIntents.create({
//           amount: amountChargedToRenter,
//           currency: "cad",
//           customer: customerId,
//           payment_method: paymentMethodId,
//           off_session: true,
//           confirm: true,
        
//           transfer_data: {
//             destination: hostStripeId,
//             // Stripe will automatically send:
//             // amount - application_fee_amount = host payout
//           },
        
//           application_fee_amount: applicationFee,
        
//           metadata: {
//             reservationId,
//             type: "early_cancellation",
//             baseAmount: cancellationBase.toString(),
//             renterCharged: amountChargedToRenter.toString(),
//             hostPaid: hostPayout.toString(),
//             platformFee: applicationFee.toString(),
//             renterId: reservation.requesterId,
//             hostId: space.userId,
//           },
//         });


//         paymentIntentId = pi.id;
//       } 
//       catch (err) {
//         console.error("Stripe cancellation charge failed:", err.raw || err);
//         throw new HttpsError(
//           "internal",
//           `Unable to process cancellation payment at this time: ${err.message}`
//         );
//       }
//     }

//     await reservationRef.update({
//       status: "cancelled_by_renter",
//       cancelledAt: now,
//       cancellation: {
//         baseAmount: cancellationBase,
//         renterFee,
//         hostFee,
//         hostPaid: hostPayout,
//         platformFee: applicationFee,
//         stripePaymentIntentId: paymentIntentId,
//         policyVersion: "v2",
//       },
//       updatedAt: now,
//     });

//     return {
//       success: true,
//       baseAmount: cancellationBase,
//     };
//   }
// );



















const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Stripe = require("stripe");

const db = admin.firestore();

let stripe;
function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET) {
      throw new HttpsError(
        "internal",
        "Stripe configuration is missing"
      );
    }
    stripe = new Stripe(process.env.STRIPE_SECRET);
    console.log("Initialized Stripe client");
  }
  return stripe;
}

function calculateCancellationBaseAmount(reservation, space) {
  const now = new Date();
  const start = reservation.startDate.toDate();
  const hoursBeforeStart = (start - now) / (1000 * 60 * 60);
  console.log("Hours before start:", hoursBeforeStart);

  // Use reservation price instead of space price
  const baseAmount = Math.round(Number(reservation.price) * 100);
  console.log("Base amount:", baseAmount);

  if (hoursBeforeStart >= 168) return 0;        // 7+ days
  if (hoursBeforeStart >= 48) return Math.round(baseAmount * 0.25);

  return Math.round(baseAmount * 0.5);          // <48h
}


exports.cancelReservationEarly = onCall(
  { secrets: ["STRIPE_SECRET"] },
  async (request) => {
    console.log("Function called with data:", request.data);

    const uid = request.auth?.uid;
    console.log("Authenticated UID:", uid);
    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to cancel a reservation"
      );
    }

    // const { reservationId } = request.data || {};


    // console.log("Reservation ID received:", reservationId);

    // if (!reservationId) {
    //   throw new HttpsError(
    //     "invalid-argument",
    //     "Reservation ID is required"
    //   );
    // }

    const { reservationId } = request.data || {};

    // If your client is sending the whole object, extract the ID
    const reservationDocId = typeof reservationId === 'object' ? reservationId.id : reservationId;

    if (!reservationDocId) {
      throw new HttpsError("invalid-argument", "Reservation ID is required");
    }

    const now = admin.firestore.Timestamp.now();
    const reservationRef = db.collection("reservations").doc(reservationDocId);

    let reservationSnap;
    try {
      // const reservationRef = db.collection("reservations").doc(reservationId);
      // const reservationRef = firestore.collection('reservations').doc(reservationId.id);
      console.log("Reservation ref:", reservationRef.path);
      reservationSnap = await reservationRef.get();
    } catch (err) {
      console.error("Error fetching reservation:", err);
      throw new HttpsError("internal", "Failed to fetch reservation");
    }

    if (!reservationSnap.exists) {
      console.log("Reservation not found for ID:", reservationDocId);
      throw new HttpsError("not-found", "Reservation does not exist");
    }

    const reservation = reservationSnap.data();
    console.log("Reservation data:", reservation);

    if (reservation.requesterId !== uid) {
      throw new HttpsError(
        "permission-denied",
        "You do not have permission to cancel this reservation"
      );
    }

    // if (reservation.status !== "confirmed") {
    //   throw new HttpsError(
    //     "failed-precondition",
    //     "Only confirmed reservations can be cancelled"
    //   );
    // }

    if (reservation.startDate.toDate() <= new Date()) {
      throw new HttpsError(
        "failed-precondition",
        "This reservation has already started"
      );
    }

    let spaceSnap;
    try {
      spaceSnap = await db.collection("spaces").doc(reservation.spaceId).get();
      console.log("Space snap exists:", spaceSnap.exists);
    } catch (err) {
      console.error("Error fetching space:", err);
      throw new HttpsError("internal", "Failed to fetch space");
    }

    if (!spaceSnap.exists) {
      throw new HttpsError(
        "not-found",
        "Associated space could not be found"
      );
    }

    const space = spaceSnap.data();
    console.log("Space data:", space);

    const cancellationBase = calculateCancellationBaseAmount(reservation, space);
    console.log("Cancellation base:", cancellationBase);

    const PLATFORM_FEE_RATE = 0.095;
    const renterFee = Math.round(cancellationBase * PLATFORM_FEE_RATE);
    const hostFee = Math.round(cancellationBase * PLATFORM_FEE_RATE);
    console.log("Renter fee:", renterFee, "Host fee:", hostFee);

    const amountChargedToRenter = cancellationBase + renterFee;
    const applicationFee = renterFee + hostFee;
    const hostPayout = cancellationBase - hostFee;
    console.log("Amounts: renter charge", amountChargedToRenter, "host payout", hostPayout, "platform fee", applicationFee);

    let paymentIntentId;
    let taxAmount = 0;

    if (cancellationBase > 0) {
      const stripeClient = getStripe();

      console.log("Fetching renter data for UID:", uid);
      const renterSnap = await db.collection("users").doc(uid).get();
      const customerData = renterSnap.data()?.stripe?.customer;
      const customerId = customerData?.customerId;
      const paymentMethodId = customerData?.defaultPaymentMethod;
      console.log("Customer ID:", customerId, "Payment method ID:", paymentMethodId);

      if (!customerId || !paymentMethodId) {
        throw new HttpsError(
          "failed-precondition",
          "Customer or default payment method not found"
        );
      }

      console.log("Fetching host data for UID:", space.userId);
      const hostSnap = await db.collection("users").doc(space.userId).get();
      const hostStripeId = hostSnap.data()?.stripe?.host?.accountId;
      console.log("Host Stripe ID:", hostStripeId);

      if (!hostStripeId) {
        throw new HttpsError(
          "failed-precondition",
          "Host is not eligible to receive payments"
        );
      }

      let hostAccount;
      try {
        hostAccount = await stripeClient.accounts.retrieve(hostStripeId);
        console.log("Host account retrieved:", hostAccount);
      } catch (err) {
        console.error("Error retrieving host Stripe account:", err);
        throw new HttpsError("internal", "Failed to retrieve host Stripe account");
      }

      const hostAddress = hostAccount.individual?.address || hostAccount.business_profile?.address;
      console.log("Host address:", hostAddress);

      try {
        // Tax calculation
        const taxCalculation = await stripeClient.tax.calculations.create({
          currency: "cad",
          customer_details: { 
            address: hostAddress || { country: "CA", state: "AB" },
            address_source: "billing"   // must be "billing" or "shipping"
          },
          line_items: [
            { 
              amount: applicationFee, 
              quantity: 1, 
              tax_code: "txcd_10000000",
              reference: "platform_fee"  // <-- required
            },
          ],
        });

        
        taxAmount = taxCalculation.amount_total;
        console.log("Calculated tax amount:", taxAmount);

        const renterTax = Math.round(taxAmount * (renterFee / applicationFee));
        const hostTax = taxAmount - renterTax;
        console.log("Renter tax:", renterTax, "Host tax:", hostTax);

        const finalRenterCharge = cancellationBase + renterFee + renterTax;
        const finalHostPayout = cancellationBase - hostFee - hostTax;
        const totalPlatformFeeWithTax = applicationFee + taxAmount;
        console.log("Final amounts: renter charge", finalRenterCharge, "host payout", finalHostPayout);

        const pi = await stripeClient.paymentIntents.create({
          amount: finalRenterCharge,
          currency: "cad",
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
          transfer_data: { destination: hostStripeId, amount: finalHostPayout },
          application_fee_amount: totalPlatformFeeWithTax,
          metadata: {
            reservationDocId,
            type: "early_cancellation",
            baseAmount: cancellationBase.toString(),
            renterCharged: finalRenterCharge.toString(),
            hostPaid: finalHostPayout.toString(),
            platformFee: applicationFee.toString(),
            platformFeeTax: taxAmount.toString(),
            renterTax: renterTax.toString(),
            hostTax: hostTax.toString(),
            renterId: reservation.requesterId,
            hostId: space.userId,
          },
        });

        paymentIntentId = pi.id;
        console.log("PaymentIntent created:", paymentIntentId);
      } catch (err) {
        console.error("Stripe cancellation charge failed:", err.raw || err);
        throw new HttpsError(
          "internal",
          `Unable to process cancellation payment at this time: ${err.message}`
        );
      }
    }

    console.log("Updating reservation document with cancellation info");
    await reservationRef.update({
      status: "cancelled_by_renter",
      cancelledAt: now,
      cancellation: {
        baseAmount: cancellationBase,
        renterFee,
        hostFee,
        hostPaid: hostPayout,
        platformFee: applicationFee,
        platformFeeTax: taxAmount || 0,
        stripePaymentIntentId: paymentIntentId,
        policyVersion: "v2",
      },
      updatedAt: now,
    });
    console.log("Reservation document updated successfully");

    return {
      success: true,
      baseAmount: cancellationBase,
    };
  }
);