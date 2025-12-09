

import React, { useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import { auth } from "../../../firebase/config";
import { createStripeAccount, getStripeOnboardingLink } from "../../../firebase/firestore/stripeFunctions";
import * as WebBrowser from 'expo-web-browser';

export default function StripeOnboarding() {
  const [loading, setLoading] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

  const handleCreateStripeAccount = async () => {
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user?.email) throw new Error("User not logged in");

      // create Stripe account
      const result = await createStripeAccount({ email: user.email });
      setStripeAccountId(result.stripeAccountId);

      Alert.alert("Success", result.message || "Stripe account created!");
    } catch (err: unknown) {
      if (err instanceof Error) Alert.alert("Error", err.message);
      else Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    try {
      const url = await getStripeOnboardingLink();
      await WebBrowser.openBrowserAsync(url);
    } catch (err: unknown) {
      if (err instanceof Error) Alert.alert("Error", err.message);
      else Alert.alert("Error", "An unexpected error occurred");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ marginBottom: 16, fontSize: 20, fontWeight: "600" }}>
        Stripe Onboarding
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Button title="Create Stripe Account" onPress={handleCreateStripeAccount} />

          {stripeAccountId && (
            <View style={{ marginTop: 24 }}>
              <Text>Your Stripe Account:</Text>
              <Text style={{ fontWeight: "bold" }}>{stripeAccountId}</Text>

              <View style={{ marginTop: 12 }}>
                <Button title="Continue Onboarding" onPress={startOnboarding} />
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

