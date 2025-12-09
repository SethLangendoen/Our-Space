
import React, { useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import { auth } from "../../../firebase/config";
import { createStripeAccount } from "../../../firebase/firestore/stripeFunctions"; // JS file

export default function StripeOnboarding() {
  const [loading, setLoading] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);




  const handleCreateStripeAccount = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user?.email || !user?.uid) throw new Error("User not logged in");


	const result: any = await createStripeAccount({ email: user.email});

	setStripeAccountId(result.stripeAccountId);
	Alert.alert("Success", result.message || "Stripe account created!");
	
	
    } catch (err: unknown) {
      if (err instanceof Error) Alert.alert("Error", err.message);
      else Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ marginBottom: 16 }}>Stripe Onboarding</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Start Stripe Onboarding" onPress={handleCreateStripeAccount} />
      )}
      {stripeAccountId && <Text style={{ marginTop: 16 }}>Account ID: {stripeAccountId}</Text>}
    </View>
  );
}


