import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { auth, db, functions } from "src/firebase/config";
import { httpsCallable } from "firebase/functions";
import {
  collection,
  doc,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";

import AddCardForm from "./AddCardForm"; // 👈 your extracted component

interface PaymentMethod {
  id: string;
  brand?: string;
  last4?: string;
  isDefault?: boolean;
}

export default function PaymentMethods() {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);

  /* ------------------ Auth listener ------------------ */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /* ------------------ Firestore listener ------------------ */
  useEffect(() => {
    if (!user?.uid) return;

    const ref = collection(doc(db, "users", user.uid), "paymentMethods");

    const unsubscribe = onSnapshot(
      ref,
      (snap: QuerySnapshot<DocumentData>) => {
        const methods: PaymentMethod[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Partial<PaymentMethod>),
        }));
        setPaymentMethods(methods);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  /* ------------------ Set default PM ------------------ */



const handleSetDefault = async (paymentMethodId: string) => {
  if (!user) return;

  try {
    // Get ID token
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not logged in");

    const idToken = await currentUser.getIdToken();

    const response = await fetch(
      "https://us-central1-our-space-8b8cd.cloudfunctions.net/setDefaultPaymentMethod",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to set default payment method");
    }
  } catch (err: any) {
    Alert.alert(
      "Error",
      err.message || "Failed to set default payment method"
    );
  }
};




  /* ------------------ Loading / auth states ------------------ */
  if (loading) return <ActivityIndicator size="large" />;
  if (!user) return <Text>Please log in to see your payment methods.</Text>;

  /* ------------------ Render ------------------ */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Methods</Text>

      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSetDefault(item.id)}
            style={[
              styles.card,
              item.isDefault && styles.defaultCard,
            ]}
          >
            <Text style={styles.cardText}>
              {item.brand?.toUpperCase() || "CARD"} •••• {item.last4 ?? "****"}
            </Text>

            {item.isDefault && (
              <Text style={styles.defaultText}>Default</Text>
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={
          showAddCard ? (
            <AddCardForm
              userId={user.uid}
              onDone={() => setShowAddCard(false)}
              onCancel={() => setShowAddCard(false)}
            />
          ) : (
            <TouchableOpacity
              onPress={() => setShowAddCard(true)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
          )
        }
      />
    </View>
  );
}

/* ------------------ Styles ------------------ */


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },

  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  defaultCard: {
    borderWidth: 2,
    borderColor: "#22c55e",
  },

  cardText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "500",
  },
  defaultText: {
    color: "#22c55e",
    marginTop: 4,
    fontWeight: "600",
  },

  addButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#2563eb",
    alignItems: "center",
    marginTop: 12,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
