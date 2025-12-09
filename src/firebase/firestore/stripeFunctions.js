

import { auth } from '../config';

export async function createStripeAccount({ email }) {
  if (!auth.currentUser) {
    throw new Error("User must be signed in.");
  }

  const idToken = await auth.currentUser.getIdToken(true);

  const response = await fetch(
    "https://us-central1-our-space-8b8cd.cloudfunctions.net/createStripeAccount",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create Stripe account");
  }

  return data;
}



// Gets an onboarding link from stripe. 
export async function getStripeOnboardingLink() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const idToken = await user.getIdToken(true);

  const response = await fetch(
    "https://us-central1-our-space-8b8cd.cloudfunctions.net/createStripeOnboardingLink",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error);

  return data.url;
}


