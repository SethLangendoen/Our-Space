const Stripe = require("stripe");

// Replace with your Stripe secret key
const stripe = new Stripe(process.env.STRIPE_SECRET);

async function closeAllConnectAccounts() {
  try {
    let hasMore = true;
    let startingAfter; // undefined initially

    while (hasMore) {
      // List accounts (max 100 at a time)
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter; // only set if not undefined
      }

      const accounts = await stripe.accounts.list(params);

      for (const account of accounts.data) {
        // Only close Connect accounts (exclude your main platform account)
        if (!account.id.startsWith("acct_")) continue;

        console.log("Closing account:", account.id);

        // Close the account
        await stripe.accounts.del(account.id);
        console.log("✅ Closed:", account.id);
      }

      hasMore = accounts.has_more;
      startingAfter = accounts.data.length ? accounts.data[accounts.data.length - 1].id : undefined;
    }

    console.log("All connect accounts processed.");
  } catch (err) {
    console.error("Error closing accounts:", err);
  }
}

closeAllConnectAccounts();
