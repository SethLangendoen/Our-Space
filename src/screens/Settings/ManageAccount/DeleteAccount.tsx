import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase/config"; // adjust path

type Reservation = {
  id: string;
  title: string;
  status:
    | "requested"
    | "awaiting_acceptance"
    | "confirmed"
    | "completed"
    | "cancelled_by_renter"
    | "cancelled_by_host";
};

const BLOCKING_STATUSES = [
  "requested",
  "awaiting_acceptance",
  "confirmed",
];

const DeleteAccount = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  type Space = {
	id: string;
	title: string;
  };
  
  const [spaces, setSpaces] = useState<Space[]>([]);  const [blockingReservations, setBlockingReservations] = useState<
    Reservation[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);


  
  useEffect(() => {
	const fetchReservations = async () => {
	  try {
		const user = auth.currentUser;
		if (!user) return;
  
		const reservationsRef = collection(db, "reservations");
  
		// Only fetch blocking statuses (reduces reads)
		const requesterQuery = query(
		  reservationsRef,
		  where("requesterId", "==", user.uid),
		  where("status", "in", BLOCKING_STATUSES)
		);
  
		const ownerQuery = query(
		  reservationsRef,
		  where("ownerId", "==", user.uid),
		  where("status", "in", BLOCKING_STATUSES)
		);
  
		const [requesterSnap, ownerSnap] = await Promise.all([
		  getDocs(requesterQuery),
		  getDocs(ownerQuery),
		]);
  
		const map = new Map<string, Reservation>();
  
		requesterSnap.forEach((doc) => {
		  const data = doc.data();
		  map.set(doc.id, {
			id: doc.id,
			title: data.spaceTitle,
			status: data.status,
		  });
		});
  
		ownerSnap.forEach((doc) => {
		  const data = doc.data();
		  map.set(doc.id, {
			id: doc.id,
			title: data.spaceTitle,
			status: data.status,
		  });
		});
  
		const blocking = Array.from(map.values());
  
		setBlockingReservations(blocking);
		setReservations(blocking); // optional, since you only care about blocking
  
	  } catch (err) {
		console.error("Error fetching reservations:", err);
	  }
	};

	const fetchSpaces = async () => {
		try {
		  const user = auth.currentUser;
		  if (!user) return;
	  
		  const spacesRef = collection(db, "spaces");
	  
		  const q = query(spacesRef, where("userId", "==", user.uid));
	  
		  const snapshot = await getDocs(q);
	  
		  const ownedSpaces = snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
			  id: doc.id,
			  title: data.title,
			};
		  });
	  
		  setSpaces(ownedSpaces);
		} catch (err) {
		  console.error("Error fetching spaces:", err);
		}
	  };
	


	fetchSpaces();
	fetchReservations();
  }, []);




  const canDelete =
  blockingReservations.length === 0 &&
  spaces.length === 0 &&
  input.trim() === "DELETE";

  const handleDelete = async () => {
    if (!canDelete) return;

    Alert.alert(
      "Delete Account",
      "Are you sure? This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // 🔥 TODO: Call your backend / Firebase function
              // await deleteUserAccount();

              setLoading(false);

              Alert.alert("Account deleted");
            } catch (error) {
              setLoading(false);
              Alert.alert("Error deleting account");
            }
          },
        },
      ]
    );
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <View style={styles.reservationItem}>
      <Text style={styles.reservationTitle}>{item.title}</Text>
      <Text style={styles.reservationStatus}>{item.status}</Text>
    </View>
  );

  return (
	<ScrollView contentContainerStyle={styles.container}>
	<Text style={styles.header}>Delete Account</Text>

      {/* ⚠️ Warning */}
      <Text style={styles.warning}>
        Deleting your account is permanent. Your profile will be removed and you
        will lose access to your account. Some data (such as reservations and
        messages) may be retained.
      </Text>

      {/* 🚫 Blocking reservations */}
      {blockingReservations.length > 0 && (
        <>
          <Text style={styles.blockingHeader}>
            You must resolve the following reservations before deleting your
            account:
          </Text>

		  {blockingReservations.map((item) => (
			<View key={item.id} style={styles.reservationItem}>
				<Text style={styles.reservationTitle}>{item.title}</Text>
				<Text style={styles.reservationStatus}>{item.status}</Text>
			</View>
			))}
        </>
      )}

		{spaces.length > 0 && (
		<>
			<Text style={styles.blockingHeader}>
			You must delete the following spaces before deleting your account:
			</Text>

			{spaces.map((item) => (
				<View key={item.id} style={styles.reservationItem}>
					<Text style={styles.reservationTitle}>{item.title}</Text>
					<Text style={styles.reservationStatus}>Owned Space</Text>
				</View>
			))}
		</>
		)}

      {/* ✍️ Delete confirmation */}
      <Text style={styles.label}>
        Type "DELETE" to confirm account deletion:
      </Text>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="DELETE"
        autoCapitalize="characters"
      />

      {/* 🗑️ Delete button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: canDelete ? "#ff3b30" : "#ccc" },
        ]}
        disabled={!canDelete || loading}
        onPress={handleDelete}
      >
        <Text style={styles.buttonText}>
          {loading ? "Deleting..." : "Delete Account"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
	container: {
		padding: 20,
		backgroundColor: "#fff",
		flexGrow: 1,
	  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  warning: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  blockingHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#d9534f",
  },
  reservationItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 8,
  },
  reservationTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  reservationStatus: {
    fontSize: 14,
    color: "#888",
  },
  label: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});