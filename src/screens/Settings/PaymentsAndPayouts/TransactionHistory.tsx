import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebase/config";

// Define transaction type
type Transaction = {
  hostId: any;
  renterId: any;
  id: string;
  type: string;
  stripeId: string;
  amount: number;
  currency: string;
  createdAt: Timestamp;
  metadata: {
    baseAmount?: string;
    hostFee?: string;
    renterFee?: string;
    hostId?: string;
    renterId?: string;
    reservationId?: string;
    [key: string]: any;
  };
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

        const userTransactions = allTransactions.filter(tx => {
          const { renterId, hostId } = tx.metadata || {};
          return renterId === user.uid || hostId === user.uid;
        });
        
		  

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

  // function getUserTransactionAmount(tx: Transaction, userId: string) {
  //   const base = Number(tx.metadata.baseAmount || 0);
  //   const hostFee = Number(tx.metadata.hostFee || 0);
  //   const renterFee = Number(tx.metadata.renterFee || 0);
  
  //   if (tx.metadata.hostId === userId) {
  //     // Host earns base - hostFee
  //     return {
  //       role: "host",
  //       amount: base - hostFee,
  //     };
  //   }
  
  //   if (tx.metadata.renterId === userId) {
  //     // Renter pays base + renterFee
  //     return {
  //       role: "renter",
  //       amount: base + renterFee,
  //     };
  //   }
  
  //   return { role: "unknown", amount: 0 };
  // }
  

  function getUserTransactionAmount(tx: Transaction, userId: string) {
    const metadata = tx.metadata || {};
    const base = Number(metadata.baseAmount || 0);
  
    // For recurring payments
    const hostFee = Number(metadata.hostFee || 0);
    const renterFee = Number(metadata.renterFee || 0);
  
    // For cancellations
    const hostPaid = Number(metadata.hostPaid || 0);
    const renterCharged = Number(metadata.renterCharged || 0);
  
    if (metadata.hostId === userId) {
      if (metadata.type === "early_cancellation") {
        return { role: "host", amount: hostPaid };
      }
      return { role: "host", amount: base - hostFee };
    }
  
    if (metadata.renterId === userId) {
      if (metadata.type === "early_cancellation") {
        return { role: "renter", amount: renterCharged };
      }
      return { role: "renter", amount: base + renterFee };
    }
  
    return { role: "unknown", amount: 0 };
  }
  



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

        renderItem={({ item }) => {
          const user = auth.currentUser!;
          const { amount, role } = getUserTransactionAmount(item, user.uid);
        
          const isHost = role === "host";
        
          return (
            <View style={styles.txCard}>
              <View style={styles.txHeader}>
                <Text style={styles.txType}>
                  {isHost ? "Earnings" : "Payment"}
                </Text>
        
                <View
                  style={[
                    styles.statusPill,
                    isHost ? styles.earnedPill : styles.paidPill,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isHost ? styles.earnedText : styles.paidText,
                    ]}
                  >
                    {isHost ? "Earned" : "Paid"}
                  </Text>
                </View>
              </View>
        
              <Text style={styles.amount}>
                {(amount / 100).toFixed(2)} {item.currency.toUpperCase()}
              </Text>
        
              <Text style={styles.date}>
                {item.createdAt?.toDate().toLocaleString()}
              </Text>
            </View>
          );
        }}
        
      
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  txCard: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "#ffffff",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    // Android shadow
    elevation: 3,
  },

  txHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  txType: {
    fontSize: 16,
    fontWeight: "600",
  },

  amount: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },

  date: {
    fontSize: 13,
    color: "#666",
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  earnedPill: {
    backgroundColor: "#e6f4ea",
  },

  paidPill: {
    backgroundColor: "#e8f0fe",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  earnedText: {
    color: "#1e8e3e",
  },

  paidText: {
    color: "#1a73e8",
  },
});
