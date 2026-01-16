import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { fetchEarnings } from "../../../firebase/firestore/earningsAPI";

interface Balance {
  available: number;
  pending: number;
  currency: string;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: string | number | Date;
}

interface EarningsData {
  balance: Balance;
  upcomingPayout?: Payout | null;
  pastPayouts: Payout[];
  totalPayouts: number;
  lastPayoutDate?: string | number | Date | null;
  allTimeEarnings?: number; // total all-time
}

export default function Earnings() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const data = await fetchEarnings();
        // calculate all-time earnings as total of past payouts + current + pending
        const allTime = (data.pastPayouts?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0) +
                        (data.balance.available || 0) +
                        (data.balance.pending || 0);
        setEarnings({ ...data, allTimeEarnings: allTime });
      } catch (err) {
        console.error("Failed to load earnings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!earnings) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load earnings.</Text>
      </View>
    );
  }

  // Safe date conversion
  const lastPayoutDate = earnings.lastPayoutDate ? new Date(earnings.lastPayoutDate) : null;
  const upcomingPayout = earnings.upcomingPayout
    ? { ...earnings.upcomingPayout, arrivalDate: new Date(earnings.upcomingPayout.arrivalDate) }
    : null;
  const pastPayouts = earnings.pastPayouts.map((p) => ({ ...p, arrivalDate: new Date(p.arrivalDate) }));

  return (
    <ScrollView style={styles.container}>
      {/* Current & Pending Balance Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Balances</Text>
        <Text style={styles.balanceText}>
          Current: <Text style={styles.amount}>${earnings.balance.available.toFixed(2)}</Text>
        </Text>
        <Text style={styles.balanceText}>
          Pending: <Text style={styles.amount}>${earnings.balance.pending.toFixed(2)}</Text>
        </Text>
        <Text style={styles.balanceText}>
          Currency: <Text style={styles.amount}>{earnings.balance.currency}</Text>
        </Text>
      </View>

      {/* All-Time Earnings */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>All-Time Earnings</Text>
        <Text style={styles.allTime}>${earnings.allTimeEarnings?.toFixed(2)}</Text>
      </View>

      {/* Upcoming Payout */}
      {upcomingPayout && (
        <View style={[styles.card, styles.upcomingCard]}>
          <Text style={styles.cardHeader}>Upcoming Payout</Text>
          <Text style={styles.balanceText}>
            Amount: <Text style={styles.amount}>${upcomingPayout.amount.toFixed(2)}</Text>
          </Text>
          <Text style={styles.balanceText}>
            Date: <Text style={styles.amount}>{upcomingPayout.arrivalDate.toLocaleDateString()}</Text>
          </Text>
          <Text style={styles.balanceText}>
            Status: <Text style={styles.amount}>{upcomingPayout.status}</Text>
          </Text>
        </View>
      )}

      {/* Last Payout Date */}
      {lastPayoutDate && (
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Last Payout</Text>
          <Text style={styles.balanceText}>{lastPayoutDate.toLocaleDateString()}</Text>
        </View>
      )}

      {/* Past Payouts */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Past Payouts</Text>
        {pastPayouts.length > 0 ? (
          pastPayouts.map((p) => (
            <View key={p.id} style={styles.payoutRow}>
              <Text style={styles.payoutText}>${p.amount.toFixed(2)}</Text>
              <Text style={styles.payoutText}>{p.status}</Text>
              <Text style={styles.payoutText}>{p.arrivalDate.toLocaleDateString()}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.text}>No past payouts available.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F8", padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 16, marginBottom: 8 },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  upcomingCard: { borderLeftWidth: 5, borderLeftColor: "#4A90E2" },
  cardHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333" },
  balanceText: { fontSize: 16, marginBottom: 6 },
  amount: { fontWeight: "bold", color: "#4A90E2" },
  allTime: { fontSize: 22, fontWeight: "bold", color: "#27AE60" },
  payoutRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  payoutText: { fontSize: 15, flex: 1, textAlign: "center" },
});
