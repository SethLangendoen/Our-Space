
import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import { auth } from "../../../firebase/config";
import {
  createStripeAccount,
  getStripeOnboardingLink,
} from "../../../firebase/firestore/stripeFunctions";
import { getUser } from "../../../firebase/firestore/users";
import * as WebBrowser from "expo-web-browser";


function StatusRow({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
      <Text style={{ fontSize: 18, marginRight: 8 }}>
        {done ? "✅" : "❌"}
      </Text>
      <Text style={{ fontSize: 16 }}>{label}</Text>
    </View>
  );
}

export default function StripeOnboarding() {
  const [loading, setLoading] = useState(true);
  const [stripe, setStripe] = useState<StripeStatus | null>(null);

  // 🔹 Load Stripe account + status
  useEffect(() => {
    const loadStripeAccount = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userData = await getUser(user.uid);
        setStripe(userData?.stripe?.host ?? null);
      } catch (err) {
        console.error("Failed to load Stripe account", err);
      } finally {
        setLoading(false);
      }
    };

    loadStripeAccount();
  }, []);



  const handleCreateStripeAccount = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user?.email) throw new Error("User not logged in");

      const result = await createStripeAccount({ email: user.email });

      setStripe({
        accountId: result.stripeAccountId,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  

  const startOnboarding = async () => {
    try {
      const url = await getStripeOnboardingLink();
      await WebBrowser.openBrowserAsync(url);
    } catch (err: unknown) {
      Alert.alert("Error", err instanceof Error ? err.message : "Unexpected error");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  type StripeStatus = {
    accountId?: string;
    detailsSubmitted?: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    onboardingComplete?: boolean;
  };

const onboardingComplete = !!stripe?.onboardingComplete;

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ marginBottom: 16, fontSize: 20, fontWeight: "600", textAlign: "center" }}>
        Stripe Onboarding
      </Text>

      {!stripe?.accountId ? (
        <Button title="Create Stripe Account" onPress={handleCreateStripeAccount} />
      ) : (
        <>
          {/* ✅ Status Checklist */}
          <View style={{ marginBottom: 20 }}>
            <StatusRow label="Stripe account created" done={!!stripe.accountId} />
            <StatusRow label="Details submitted" done={!!stripe.detailsSubmitted} />
            <StatusRow label="Payments enabled" done={!!stripe.chargesEnabled} />
            <StatusRow label="Payouts enabled" done={!!stripe.payoutsEnabled} />
          </View>

          {/* ℹ️ Review message */}
          {!onboardingComplete && stripe.detailsSubmitted && !stripe.chargesEnabled && (
            <Text style={{ marginBottom: 12, color: "#666" }}>
              Stripe is reviewing your information. This can take some time.
            </Text>
          )}

          {/* 🔁 Resume onboarding if needed */}
          {!onboardingComplete && (
            <Button title="Continue onboarding" onPress={startOnboarding} />
          )}

          {/* 🎉 Complete */}
          {onboardingComplete && (
            <Text style={{ color: "green", fontWeight: "600", textAlign: "center" }}>
              🎉 Stripe onboarding complete!
            </Text>
          )}
        </>
      )}
    </View>
  );
}
