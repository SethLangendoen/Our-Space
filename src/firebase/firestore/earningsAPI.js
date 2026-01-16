import { getAuth } from "firebase/auth";
import { firebaseApp } from "../config"; // adjust if needed
export async function fetchEarnings() {
	const user = getAuth(firebaseApp).currentUser;
	if (!user) throw new Error("User not logged in");
  
	const idToken = await user.getIdToken(true);
  
	const response = await fetch(
	  "https://us-central1-our-space-8b8cd.cloudfunctions.net/getStripeEarnings",
	  {
		method: "GET",
		headers: {
		  Authorization: `Bearer ${idToken}`,
		},
	  }
	);
  
	const text = await response.text();
  
	let data;
	try {
	  data = JSON.parse(text);
	} catch {
	  throw new Error(`Server returned non-JSON:\n${text}`);
	}
  
	if (!response.ok) {
	  throw new Error(data.error || "Failed to fetch earnings");
	}
  
	return data;
  }
  