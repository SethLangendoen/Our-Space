import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { getStripeLoginLink } from "../../../firebase/firestore/stripeFunctions";

export default function PayoutAccounts() {
  const [loading, setLoading] = useState(false);

  const handleOpenDashboard = async () => {
    try {
      setLoading(true);

      const url = await getStripeLoginLink();

      await WebBrowser.openBrowserAsync(url);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to open Stripe dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex:1, justifyContent:"center", padding:24 }}>
      <Text style={{ fontSize:22, fontWeight:"600", marginBottom:12 }}>
        Payouts & Earnings
      </Text>

      <Text style={{ color:"#666", marginBottom:20 }}>
        Manage your payout account, bank details, tax info, and view earnings.
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button
          title="Open Stripe Dashboard"
          onPress={handleOpenDashboard}
        />
      )}
    </View>
  );
}