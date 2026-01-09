import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebase/config";

// Define transaction type
type Transaction = {
  id: string;
  type: string;
  stripeId: string;
  reservationId?: string | null;
  amount: number;
  currency: string;
  metadata: Record<string, any>;
  createdAt: Timestamp;
  renterId?: string | null;
  hostId?: string | null;
};

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("[DEBUG] No user logged in");
          return;
        }

        console.log("[DEBUG] Fetching all transactions...");
        const querySnapshot = await getDocs(collection(db, "transactions"));

        console.log(`[DEBUG] Total transactions fetched: ${querySnapshot.size}`);

        // Map documents to Transaction type
        const allTransactions: Transaction[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Transaction, "id">)
        }));

		const userTransactions = allTransactions.filter(tx =>
			tx.metadata?.renterId === user.uid || tx.metadata?.hostId === user.uid
		  );
		  

        console.log(`[DEBUG] Transactions after filtering for user: ${userTransactions.length}`);

        // Sort descending by createdAt
        userTransactions.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });

        console.log("[DEBUG] Sorted transactions:", userTransactions.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          renterId: tx.renterId,
          hostId: tx.hostId,
          createdAt: tx.createdAt?.toDate().toLocaleString(),
        })));

        setTransactions(userTransactions);
      } catch (err) {
        console.error("[ERROR] Fetching transactions failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!transactions.length) {
    return (
      <View style={styles.center}>
        <Text>No transactions found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.txCard}>
            <Text style={styles.txType}>{item.type}</Text>
            <Text>
              Amount: {(item.amount / 100).toFixed(2)} {item.currency.toUpperCase()}
            </Text>
            <Text>Reservation: {item.reservationId || "N/A"}</Text>
            <Text>Date: {item.createdAt?.toDate().toLocaleString() || "Unknown"}</Text>
            <Text>Renter: {item.renterId || "N/A"}</Text>
            <Text>Host: {item.hostId || "N/A"}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  txCard: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  txType: {
    fontWeight: "bold",
    marginBottom: 4,
  },
});
