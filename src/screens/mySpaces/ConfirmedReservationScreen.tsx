// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../../firebase/config';

// type Reservation = {
//   ownerId: string;
//   requesterId: string;
//   spaceTitle: string;
//   description: string;
//   startDate: any; // Firestore Timestamp
//   endDate: any;   // Firestore Timestamp
// };

// type RouteParams = {
//   reservationId: string;
// };

// export default function ConfirmedReservationScreen() {
//   const route = useRoute();
//   const { reservationId } = route.params as RouteParams;

//   const [reservation, setReservation] = useState<Reservation | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchReservation = async () => {
//       try {
//         const docRef = doc(db, 'reservations', reservationId);
//         const snapshot = await getDoc(docRef);
//         if (snapshot.exists()) {
//           setReservation(snapshot.data() as Reservation);
//         } else {
//           console.error('Reservation not found');
//         }
//       } catch (error) {
//         console.error('Error fetching reservation:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReservation();
//   }, [reservationId]);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#334E35" />
//       </View>
//     );
//   }

//   if (!reservation) {
//     return (
//       <View style={styles.centered}>
//         <Text>Reservation not found.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>{reservation.spaceTitle}</Text>
//       <Text style={styles.label}>Start Date:</Text>
//       <Text style={styles.value}>
//         {reservation.startDate?.toDate().toDateString()}
//       </Text>

//       <Text style={styles.label}>End Date:</Text>
//       <Text style={styles.value}>
//         {reservation.endDate?.toDate().toDateString()}
//       </Text>

//       <Text style={styles.label}>Description:</Text>
//       <Text style={styles.value}>{reservation.description}</Text>

//       <Text style={styles.label}>Roles:</Text>
//       <Text style={styles.value}>Owner ID: {reservation.ownerId}</Text>
//       <Text style={styles.value}>Requester ID: {reservation.requesterId}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#333',
//   },
//   label: {
//     fontSize: 16,
//     marginTop: 10,
//     color: '#555',
//   },
//   value: {
//     fontSize: 16,
//     color: '#111',
//   },
// });



import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
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
  spaceImage?: string;
  ownerInfo?: { firstName: string; profileImage?: string };
  requesterInfo?: { firstName: string; profileImage?: string };
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
          const data = snapshot.data() as Reservation;

          // Fetch user info
          const ownerSnap = await getDoc(doc(db, 'users', data.ownerId));
          const requesterSnap = await getDoc(doc(db, 'users', data.requesterId));
          if (ownerSnap.exists()) {
            const ownerData = ownerSnap.data() as { firstName: string; profileImage?: string };
            data.ownerInfo = {
              firstName: ownerData.firstName || 'Owner',
              profileImage: ownerData.profileImage,
            };
          }
          
          if (requesterSnap.exists()) {
            const requesterData = requesterSnap.data() as { firstName: string; profileImage?: string };
            data.requesterInfo = {
              firstName: requesterData.firstName || 'Requester',
              profileImage: requesterData.profileImage,
            };
          }
          
          setReservation(data);
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
      {/* Users at the top */}
      <View style={styles.profileRow}>
        <View style={styles.profileBox}>
          <Image
            source={{ uri: reservation.requesterInfo?.profileImage || 'https://placekitten.com/80/80' }}
            style={styles.avatar}
          />
          <Text style={styles.nameText}>{reservation.requesterInfo?.firstName || 'Requester'}</Text>
        </View>
        <View style={styles.profileBox}>
          <Image
            source={{ uri: reservation.ownerInfo?.profileImage || 'https://placekitten.com/80/80' }}
            style={styles.avatar}
          />
          <Text style={styles.nameText}>{reservation.ownerInfo?.firstName || 'Owner'}</Text>
        </View>
      </View>

      {/* Space Info */}
      <View style={styles.spaceInfo}>
        {reservation.spaceImage && (
          <Image source={{ uri: reservation.spaceImage }} style={styles.spaceImage} />
        )}
        <Text style={styles.spaceTitle}>{reservation.spaceTitle}</Text>
      </View>

      {/* Dates & Description */}
      <View style={styles.details}>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Start:</Text> {reservation.startDate?.toDate().toDateString()}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>End:</Text> {reservation.endDate?.toDate().toDateString()}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Description:</Text> {reservation.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  profileBox: { alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ccc' },
  nameText: { marginTop: 6, fontWeight: '500' },
  spaceInfo: { alignItems: 'center', marginBottom: 20 },
  spaceImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  spaceTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  details: { padding: 10, backgroundColor: '#f6f6f6', borderRadius: 8 },
  detailText: { marginBottom: 6, fontSize: 16 },
  bold: { fontWeight: '600' },
});
