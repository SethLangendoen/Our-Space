

import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";
import { CardField, useConfirmSetupIntent } from "@stripe/stripe-react-native";
import { auth } from "src/firebase/config";

type Props = {
  userId: string;
  onDone: () => void;
  onCancel?: () => void;
};

export default function AddCardForm({ userId, onDone, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const { confirmSetupIntent } = useConfirmSetupIntent();
  const [cardDetails, setCardDetails] = useState<any>(null);

  const handleAddCard = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Please enter complete card details");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const idToken = await user.getIdToken();

      // Create SetupIntent
      const setupResponse = await fetch(
        "https://us-central1-our-space-8b8cd.cloudfunctions.net/createSetupIntent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const setupData = await setupResponse.json();
      if (!setupData.clientSecret) {
        throw new Error("Missing clientSecret");
      }

      // Confirm card
      const { setupIntent, error } = await confirmSetupIntent(
        setupData.clientSecret,
        { paymentMethodType: "Card" }
      );

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      if (!setupIntent?.paymentMethod?.id) {
        throw new Error("Missing payment method ID");
      }

      // Attach payment method
      const attachResponse = await fetch(
        "https://us-central1-our-space-8b8cd.cloudfunctions.net/attachPaymentMethod",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            paymentMethodId: setupIntent.paymentMethod.id,
          }),
        }
      );

      const attachData = await attachResponse.json();
      if (!attachData.success) {
        throw new Error(attachData.error || "Failed to attach card");
      }

      Alert.alert("Success", "Card added");
      onDone();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a new card</Text>

      <View style={styles.cardWrapper}>
        <CardField
          postalCodeEnabled
          placeholders={{ number: "4242 4242 4242 4242" }}
          cardStyle={{
            backgroundColor: "#ffffff",
            textColor: "#000000",
            placeholderColor: "#9ca3af", // grey placeholder
            borderRadius: 12,
          }}
          style={styles.cardField}
          onCardChange={setCardDetails}
        />
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleAddCard}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Adding…" : "Add Card"}
        </Text>
      </Pressable>

      {onCancel && (
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  cardWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  cardField: {
    height: 52,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#6b7280",
    fontSize: 15,
  },
});
