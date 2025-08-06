import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

type Reservation = {
  ownerId: string;
  requesterId: string;
  spaceTitle: string;
  description: string;
  startDate: any; // Firestore Timestamp
  endDate: any;   // Firestore Timestamp
};

type RouteParams = {
  reservationId: string;
};

export default function ConfirmedReservationScreen() {
  const route = useRoute();
  const { reservationId } = route.params as RouteParams;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const docRef = doc(db, 'reservations', reservationId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setReservation(snapshot.data() as Reservation);
        } else {
          console.error('Reservation not found');
        }
      } catch (error) {
        console.error('Error fetching reservation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#334E35" />
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.centered}>
        <Text>Reservation not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{reservation.spaceTitle}</Text>
      <Text style={styles.label}>Start Date:</Text>
      <Text style={styles.value}>
        {reservation.startDate?.toDate().toDateString()}
      </Text>

      <Text style={styles.label}>End Date:</Text>
      <Text style={styles.value}>
        {reservation.endDate?.toDate().toDateString()}
      </Text>

      <Text style={styles.label}>Description:</Text>
      <Text style={styles.value}>{reservation.description}</Text>

      <Text style={styles.label}>Roles:</Text>
      <Text style={styles.value}>Owner ID: {reservation.ownerId}</Text>
      <Text style={styles.value}>Requester ID: {reservation.requesterId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    color: '#555',
  },
  value: {
    fontSize: 16,
    color: '#111',
  },
});
