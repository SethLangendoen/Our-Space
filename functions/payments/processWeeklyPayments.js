import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();

const stripe = new Stripe(functions.config().stripe.secret, { apiVersion: '2025-12-01' });

const PLATFORM_FEE_PERCENT = 0.1; // 10%

export const processWeeklyPayments = functions.pubsub
  .schedule('every 24 hours')   // runs daily
  .onRun(async () => {
    const snapshot = await admin.firestore().collection('reservations')
      .where('status', '==', 'confirmed')
      .get();

    const now = new Date();

    for (const doc of snapshot.docs) {
      const reservation = doc.data();

      // Skip if reservation ended
      if (reservation.endDate.toDate() < now) continue;

      const lastPayment = reservation.lastPaymentDate?.toDate() || reservation.startDate.toDate();
      const nextPaymentDate = new Date(lastPayment.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (nextPaymentDate > now) continue;

      const spaceDoc = await admin.firestore().collection('spaces').doc(reservation.spaceId).get();
      if (!spaceDoc.exists) continue;

      const pricePerDay = parseFloat(spaceDoc.data()?.price || '0');
      const remainingDays = Math.ceil((reservation.endDate.toDate().getTime() - nextPaymentDate.getTime()) / (1000*60*60*24));
      const chargeDays = Math.min(7, remainingDays + 1);
      const totalAmount = chargeDays * pricePerDay;

      const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT * 100); 
      const hostAmount = Math.round(totalAmount * (1 - PLATFORM_FEE_PERCENT) * 100); 

      try {
        // Charge renter & pay host in one call
        await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100),
          currency: 'cad',
          customer: reservation.requesterStripeCustomerId,
          payment_method: 'pm_card_visa', 
          off_session: true,
          confirm: true,
          transfer_data: {
            destination: reservation.ownerStripeAccountId, 
            amount: hostAmount,
          },
          application_fee_amount: platformFee, 
        });

        // Update last and next payment dates
        const newLastPayment = admin.firestore.Timestamp.fromDate(now);
        const newNextPayment = admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

        await doc.ref.update({
          lastPaymentDate: newLastPayment,
          nextPaymentDate: newNextPayment,
        });

        console.log(`Processed payment for reservation ${doc.id}: $${totalAmount} CAD`);
      } catch (err) {
        console.error(`Failed to process payment for reservation ${doc.id}:`, err);
        // Optionally, notify admins or retry later
      }
    }
  });
