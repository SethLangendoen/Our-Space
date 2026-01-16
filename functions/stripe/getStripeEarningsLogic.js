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

async function getStripeEarningsLogic({ userId }) {
  if (!userId) throw new Error("Missing userId");

  const db = admin.firestore();
  const userDoc = await db.collection("users").doc(userId).get();

  const accountId = userDoc.data()?.stripe?.host?.accountId;
  if (!accountId) throw new Error("Stripe account not found for user");

  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe client not available");

  // 1️⃣ Current balance
  const balance = await stripe.balance.retrieve({ stripeAccount: accountId });

  // 2️⃣ Upcoming payout (pending)
  const upcomingList = await stripe.payouts.list({
    limit: 1,
    stripeAccount: accountId,
    status: "pending",
  });
  const upcomingPayout = upcomingList.data[0] || null;

  // 3️⃣ Payout schedule
  const account = await stripe.accounts.retrieve(accountId);
  const payoutSchedule = account.settings.payouts.schedule;

  // 4️⃣ Last 10 payouts
  const pastList = await stripe.payouts.list({
    limit: 10,
    stripeAccount: accountId,
  });

  // 5️⃣ Total payouts (last 10 for now)
  const totalPayouts = pastList.data.reduce((sum, p) => sum + p.amount, 0) / 100;

  // 6️⃣ Format balances for frontend
  const formattedBalance = {
    available: balance.available[0]?.amount ? balance.available[0].amount / 100 : 0,
    pending: balance.pending[0]?.amount ? balance.pending[0].amount / 100 : 0,
    currency: balance.available[0]?.currency || "USD",
  };

  // 7️⃣ Format upcoming payout
  const formattedUpcomingPayout = upcomingPayout
    ? {
        id: upcomingPayout.id,
        amount: upcomingPayout.amount / 100,
        currency: upcomingPayout.currency,
        status: upcomingPayout.status,
        arrivalDate: new Date(upcomingPayout.arrival_date * 1000),
      }
    : null;

  // 8️⃣ Format past payouts
  const formattedPastPayouts = pastList.data.map((p) => ({
    id: p.id,
    amount: p.amount / 100,
    currency: p.currency,
    status: p.status,
    arrivalDate: new Date(p.arrival_date * 1000),
  }));

  // 9️⃣ Last payout date
  const lastPayoutDate = pastList.data[0]
    ? new Date(pastList.data[0].arrival_date * 1000)
    : null;

  return {
    balance: formattedBalance,
    upcomingPayout: formattedUpcomingPayout,
    payoutSchedule,
    pastPayouts: formattedPastPayouts,
    totalPayouts,
    lastPayoutDate,
  };
}

module.exports = { getStripeEarningsLogic };
