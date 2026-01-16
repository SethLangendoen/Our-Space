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
  }
  return stripe;
}

function calculateCancellationBaseAmount(reservation, space) {
  const now = new Date();
  const start = reservation.startDate.toDate();
  const hoursBeforeStart = (start - now) / (1000 * 60 * 60);

  const baseAmount = Math.round(Number(space.price) * 100);

  if (hoursBeforeStart >= 168) return 0;        // 7+ days
  if (hoursBeforeStart >= 48) return Math.round(baseAmount * 0.25);

  return Math.round(baseAmount * 0.5);          // <48h
}

exports.cancelReservationEarly = onCall(
  { secrets: ["STRIPE_SECRET"] },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in to cancel a reservation"
      );
    }

    const { reservationId } = request.data || {};
    if (!reservationId) {
      throw new HttpsError(
        "invalid-argument",
        "Reservation ID is required"
      );
    }

    const now = admin.firestore.Timestamp.now();

    const reservationRef = db.collection("reservations").doc(reservationId);
    const reservationSnap = await reservationRef.get();

    if (!reservationSnap.exists) {
      throw new HttpsError("not-found", "Reservation does not exist");
    }

    const reservation = reservationSnap.data();

    if (reservation.requesterId !== uid) {
      throw new HttpsError(
        "permission-denied",
        "You do not have permission to cancel this reservation"
      );
    }

    if (reservation.status !== "confirmed") {
      throw new HttpsError(
        "failed-precondition",
        "Only confirmed reservations can be cancelled"
      );
    }

    if (reservation.startDate.toDate() <= new Date()) {
      throw new HttpsError(
        "failed-precondition",
        "This reservation has already started"
      );
    }

    const spaceSnap = await db.collection("spaces").doc(reservation.spaceId).get();
    if (!spaceSnap.exists) {
      throw new HttpsError(
        "not-found",
        "Associated space could not be found"
      );
    }

    const space = spaceSnap.data();

    const cancellationBase = calculateCancellationBaseAmount(reservation, space);

    let paymentIntentId = null;

    const PLATFORM_FEE_RATE = 0.095;

    const renterFee = Math.round(cancellationBase * PLATFORM_FEE_RATE);
    const hostFee = Math.round(cancellationBase * PLATFORM_FEE_RATE);

    const amountChargedToRenter = cancellationBase + renterFee;
    const applicationFee = renterFee + hostFee;
    const hostPayout = cancellationBase - hostFee;

    if (cancellationBase > 0) {
      const stripeClient = getStripe();

      // Use the stored default payment method directly
      const renterSnap = await db.collection("users").doc(uid).get();
      const customerData = renterSnap.data()?.stripe?.customer;
      const customerId = customerData?.customerId;
      const paymentMethodId = customerData?.defaultPaymentMethod;

      if (!customerId || !paymentMethodId) {
        throw new HttpsError(
          "failed-precondition",
          "Customer or default payment method not found"
        );
      }

      const hostSnap = await db.collection("users").doc(space.userId).get();
      const hostStripeId = hostSnap.data()?.stripe?.host?.accountId;

      if (!hostStripeId) {
        throw new HttpsError(
          "failed-precondition",
          "Host is not eligible to receive payments"
        );
      }


      try {

        const pi = await stripeClient.paymentIntents.create({
          amount: amountChargedToRenter,
          currency: "cad",
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
        
          transfer_data: {
            destination: hostStripeId,
            // Stripe will automatically send:
            // amount - application_fee_amount = host payout
          },
        
          application_fee_amount: applicationFee,
        
          metadata: {
            reservationId,
            type: "early_cancellation",
            baseAmount: cancellationBase.toString(),
            renterCharged: amountChargedToRenter.toString(),
            hostPaid: hostPayout.toString(),
            platformFee: applicationFee.toString(),
            renterId: reservation.requesterId,
            hostId: space.userId,
          },
        });


        paymentIntentId = pi.id;
      } 
      catch (err) {
        console.error("Stripe cancellation charge failed:", err.raw || err);
        throw new HttpsError(
          "internal",
          `Unable to process cancellation payment at this time: ${err.message}`
        );
      }
    }

    await reservationRef.update({
      status: "cancelled_by_renter",
      cancelledAt: now,
      cancellation: {
        baseAmount: cancellationBase,
        renterFee,
        hostFee,
        hostPaid: hostPayout,
        platformFee: applicationFee,
        stripePaymentIntentId: paymentIntentId,
        policyVersion: "v2",
      },
      updatedAt: now,
    });

    return {
      success: true,
      baseAmount: cancellationBase,
    };
  }
);
