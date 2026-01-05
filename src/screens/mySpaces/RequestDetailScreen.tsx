

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { addReservedTime } from 'src/firebase/firestore/posts';
import { getSpaceById } from 'src/firebase/firestore/posts';
// import { Space } from 'src/types/space';




export default function RequestDetailScreen() {
  const route = useRoute();
  const { reservationId } = route.params as { reservationId: string };

  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [requesterInfo, setRequesterInfo] = useState<any>(null);
  const [totalDays, setTotalDays] = useState<number | null>(null);
  const [space, setSpace] = useState<any>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return unsub;
  }, []);

  useEffect(() => {

      const fetchReservation = async () => {
        try {
          // 1️⃣ Get reservation document
          const docSnap = await getDoc(doc(db, 'reservations', reservationId));
          if (!docSnap.exists()) return;
    
          const resData = docSnap.data();
          setReservation(resData); // no type checks, just store whatever
    
          // 2️⃣ Fetch users
          const [requesterSnap, ownerSnap] = await Promise.all([
            getDoc(doc(db, 'users', resData.requesterId)),
            getDoc(doc(db, 'users', resData.ownerId)),
          ]);
    
          if (requesterSnap.exists()) setRequesterInfo(requesterSnap.data());
          if (ownerSnap.exists()) setOwnerInfo(ownerSnap.data());
    
          // 3️⃣ Fetch space
          if (resData.spaceId) {
            const spaceData: any = await getSpaceById(resData.spaceId); // getSpaceById also returns loose object
            setSpace(spaceData);
    
            // 4️⃣ Calculate total cost
            if (spaceData?.price && resData.startDate && resData.endDate) {
              const start = resData.startDate.toDate();
              const end = resData.endDate.toDate();
    
              const MS_PER_DAY = 1000 * 60 * 60 * 24;
              const days = Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
    
              const priceNumber = parseFloat(spaceData.price); // convert string to number
              setTotalCost(days * priceNumber);
              setTotalDays(days); // <-- store total days

            }
          }
        } catch (err) {
          console.error('Failed to load reservation', err);
        } finally {
          setLoading(false);
        }
      };
  

    fetchReservation();
  }, [reservationId]);

  const handleCancelRequest = async () => {
    if (!reservation) return;
  
    Alert.alert(
      'Cancel Reservation Request',
      'Are you sure you want to cancel this request? This cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'reservations', reservationId));
              Alert.alert('Cancelled', 'Your reservation request has been cancelled.');
  
              // Go back to previous screen
              navigation.goBack();
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to cancel reservation request.');
            }
          },
        },
      ]
    );
  };
  



  const updateStatus = async (newStatus: string) => {
    if (!reservation) return;
  
    try {
      const updateData: any = { status: newStatus };
  
      // if moving to confirmed, set payment tracking fields
      if (newStatus === 'confirmed') {
        updateData.lastPaymentDate = null; // no payments yet
        updateData.nextPaymentDate = reservation.startDate; // first payment due on start date
      }
  
      await updateDoc(doc(db, 'reservations', reservationId), updateData);
  
      setReservation({ ...reservation, ...updateData });
  
      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status', err);
      Alert.alert('Error', 'Failed to update status.');
    }
  };
  

  
  const handleAcceptReservation = async () => {
    if (!reservation) return;
  
    try {
      // 1. Update reservation status
      await updateStatus('confirmed');
  
      // 2. Add reserved time to the space
      if (reservation.spaceId) {
        await addReservedTime(
          reservation.spaceId,
          reservation.startDate.toDate().toISOString().split('T')[0],
          reservation.endDate.toDate().toISOString().split('T')[0]
        );
      }
  
      Alert.alert('Success', 'Reservation confirmed and time added to space.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to finalize reservation.');
    }
  };
  
  

  const canConfirm = userId === reservation?.ownerId && reservation?.status === 'requested';
  const canAccept = userId === reservation?.requesterId && reservation?.status === 'awaiting_acceptance';

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (!reservation) return <Text>Reservation not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservation Request</Text>

      <View style={styles.profileRow}>
        <View style={styles.profileBox}>
          <Image
            source={{ uri: requesterInfo?.profileImage || 'https://placekitten.com/80/80' }}
            style={styles.avatar}
          />
          <Text style={styles.nameText}>{requesterInfo?.firstName} (Requester)</Text>
        </View>

        <View style={styles.profileBox}>
          <Image
            source={{ uri: ownerInfo?.profileImage || 'https://placekitten.com/80/80' }}
            style={styles.avatar}
          />
          <Text style={styles.nameText}>{ownerInfo?.firstName} (Owner)</Text>
        </View>
      </View>

	  {reservation.space && (
			<View style={styles.postInfo}>
				<Image
				source={{ uri: reservation.space.mainImage || 'https://placekitten.com/300/200' }}
				style={styles.postImage}
				/>
				<Text style={styles.postTitle}>{reservation.space.title || 'Untitled Space'}</Text>
			</View>
			)}


      <View style={styles.details}>
        <Text style={styles.detailText}><Text style={styles.bold}>Status:</Text> {reservation.status}</Text>
        <Text style={styles.detailText}><Text style={styles.bold}>Start:</Text> {reservation.startDate.toDate().toDateString()}</Text>
        <Text style={styles.detailText}><Text style={styles.bold}>End:</Text> {reservation.endDate.toDate().toDateString()}</Text>
        <Text style={styles.detailText}><Text style={styles.bold}>Description:</Text> {reservation.description}</Text>
      </View>


      {space && totalCost !== null && totalDays !== null && (
        <View style={styles.pricingBox}>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Price per day:</Text> ${space.price}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Total Days Booked:</Text> {totalDays}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Total cost:</Text> ${totalCost}
          </Text>
          <Text>Date Charged: Upon Booking confirmation</Text>
        </View>
      )}




	  <View style={styles.statusExplanation}>

      <Text style={styles.explanationTitle}>What this means:</Text>

      {reservation.status === 'requested' && userId === reservation.ownerId && (
        <Text style={styles.explanationText}>
          By confirming this reservation, you allow the requester to review and accept the booking.
          Once they accept, the reservation will be confirmed and payment will be processed.
        </Text>
      )}

      {reservation.status === 'requested' && userId === reservation.requesterId && (
        <Text style={styles.explanationText}>
          Your request is awaiting confirmation from the owner. Once they confirm, you'll be able to accept the booking and finalize payment.
        </Text>
      )}

      {reservation.status === 'awaiting_acceptance' && userId === reservation.ownerId && (
        <Text style={styles.explanationText}>
          You've confirmed this reservation. Now waiting on the requester to accept and finalize the booking.
        </Text>
      )}

      {reservation.status === 'awaiting_acceptance' && userId === reservation.requesterId && (
        <Text style={styles.explanationText}>
          The owner has confirmed your reservation. By accepting, the booking will be finalized and payment will be completed.
        </Text>
      )}

      {reservation.status === 'confirmed' && (
        <Text style={styles.explanationText}>
          This reservation is confirmed. Both parties can now prepare for the move-in and storage process.
        </Text>
      )}

    </View>

    {userId === reservation.requesterId &&
    (reservation.status === 'requested' ||
      reservation.status === 'awaiting_acceptance') && (
        <View style={{ marginTop: 12 }}>
          <Button
            title="Cancel Request"
            color="red"
            onPress={handleCancelRequest}
          />
        </View>
    )}




      {canConfirm && (
        <Button title="Confirm Request" onPress={() => updateStatus('awaiting_acceptance')} />
      )}

      {/* {canAccept && (
        <Button title="Accept Reservation" onPress={() => updateStatus('confirmed')} />
      )} */}

      {canAccept && (
        <Button title="Accept Reservation" onPress={handleAcceptReservation} />
      )}



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  profileBox: {
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ccc',
  },
  nameText: {
    marginTop: 6,
    fontWeight: '500',
  },
  details: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
  },
  detailText: {
    marginBottom: 6,
    fontSize: 16,
  },
  bold: {
    fontWeight: '600',
  },
  statusExplanation: {
	backgroundColor: '#e6f4ea',
	padding: 12,
	borderRadius: 10,
	marginBottom: 20,
	borderWidth: 1,
	borderColor: '#b5e0c6',
  },
  explanationTitle: {
	fontWeight: '600',
	fontSize: 16,
	marginBottom: 6,
  },
  explanationText: {
	fontSize: 14,
	color: '#333',
	lineHeight: 20,
  },
  postInfo: {
	marginBottom: 20,
	alignItems: 'center',
  },
  postImage: {
	width: '100%',
	height: 180,
	borderRadius: 10,
	marginBottom: 10,
  },
  postTitle: {
	fontSize: 18,
	fontWeight: '600',
	textAlign: 'center',
  },
  pricingBox: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#eef3ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  
  
});
