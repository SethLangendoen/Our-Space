

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Button, ScrollView, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, storage } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { addReservedTime } from 'src/firebase/firestore/posts';
import { getSpaceById } from 'src/firebase/firestore/posts';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';

// import { Space } from 'src/types/space';
import {
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import BlockedCalendar from 'src/components/BlockedCalendar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MySpacesStackParamList } from 'src/types/types';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

type Props = NativeStackScreenProps<MySpacesStackParamList, 'RequestDetailScreen'>;

export default function RequestDetailScreen({ navigation, route }: Props) {
  const { reservationId } = route.params as { reservationId: string };

  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [requesterInfo, setRequesterInfo] = useState<any>(null);
  const [totalDays, setTotalDays] = useState<number | null>(null);
  const [space, setSpace] = useState<any>(null);
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);  
  const [editedStart, setEditedStart] = useState<Date | null>(null);
  const [editedEnd, setEditedEnd] = useState<Date | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const role = userId === reservation?.ownerId ? 'host' : 'renter';


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });
    return unsub;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchReservation = async () => {
        setLoading(true);
        try {
          const docSnap = await getDoc(doc(db, 'reservations', reservationId));
          if (docSnap.exists()) {
            setReservation(docSnap.data());
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
  
      fetchReservation();
    }, [reservationId])
  );
  

  useEffect(() => {

      const fetchReservation = async () => {
        try {
          // 1️⃣ Get reservation document
          const docSnap = await getDoc(doc(db, 'reservations', reservationId));
          if (!docSnap.exists()) return;
    
          const resData = docSnap.data();
          setReservation(resData); // no type checks, just store whatever

          // setting the 
          setEditedStart(resData.startDate.toDate());
          setEditedEnd(resData.endDate.toDate());
          setEditedDescription(resData.description || '');
    
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




  const sendCancellationMessage = async () => {
    if (!auth.currentUser || !reservation) return;
  
    const senderId = auth.currentUser.uid;
    const receiverId = reservation.ownerId;
  
    const chatId = [senderId, receiverId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
  
    const messageText = `🚫 Reservation request canceled for "${reservation.spaceTitle}"`;
  
    // Ensure chat exists / update metadata
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        users: [senderId, receiverId],
        lastMessage: messageText,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        chatRef,
        {
          lastMessage: messageText,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  
    // Add system-style message
    await addDoc(collection(chatRef, 'messages'), {
      text: messageText,
      senderId,
      createdAt: serverTimestamp(),
      type: 'system', // 🔑 important for UI styling later
      action: 'reservation_canceled',
      reservationId,
    });
  };

  
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
              // 1️⃣ Send system message
              await sendCancellationMessage();
  
              // 2️⃣ Delete reservation
              await deleteDoc(doc(db, 'reservations', reservationId));
  
              Alert.alert('Cancelled', 'Your reservation request has been cancelled.');
  
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
  
  const sendDeniedMessage = async () => {
    if (!auth.currentUser || !reservation) return;
  
    const senderId = auth.currentUser.uid;
    const receiverId = reservation.requesterId; // owner is denying the requester
  
    const chatId = [senderId, receiverId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
  
    const messageText = `❌ Your reservation request for "${reservation.spaceTitle}" was denied by the owner.`;
  
    // Ensure chat exists / update metadata
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      await setDoc(chatRef, {
        users: [senderId, receiverId],
        lastMessage: messageText,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        chatRef,
        {
          lastMessage: messageText,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  
    // Add system-style message
    await addDoc(collection(chatRef, 'messages'), {
      text: messageText,
      senderId,
      createdAt: serverTimestamp(),
      type: 'system',
      action: 'reservation_denied',
      reservationId,
    });
  };
  
  const handleDenyRequest = async () => {
    if (!reservation) return;
  
    Alert.alert(
      'Deny Reservation Request',
      'Are you sure you want to deny this request? This cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Deny',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1️⃣ Send system message
              await sendDeniedMessage();
  
              // 2️⃣ Delete reservation
              await deleteDoc(doc(db, 'reservations', reservationId));
  
              Alert.alert('Denied', 'The reservation request has been denied.');
  
              navigation.goBack();
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to deny reservation request.');
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
      // if (newStatus === 'confirmed') {
      //   updateData.lastPaymentDate = null; // no payments yet
      //   updateData.nextPaymentDate = reservation.startDate; // first payment due on start date
      // }

      if (newStatus === 'confirmed') {
        updateData.lastPaymentDate = null;
        updateData.nextPaymentDate = reservation.startDate;
      
        if (!reservation.security) {
          updateData.security = {
            code: generateSecurityCode(),
            codeVerified: false,
            photoUrl: null,
            photoUploaded: false,
            completed: false,
          };
        }
      }
      

  
      await updateDoc(doc(db, 'reservations', reservationId), updateData);
  
      setReservation({ ...reservation, ...updateData });
  
      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status', err);
      Alert.alert('Error', 'Failed to update status.');
    }
  };

  const canEdit =
  userId === reservation?.requesterId &&
  reservation?.status !== 'confirmed';
  const handleSaveEdit = async () => {
    if (!editedStart || !editedEnd) {
      Alert.alert('Invalid dates', 'Please select a valid date range.');
      return;
    }
  
    try {
      // 1️⃣ Update reservation in Firestore
      await updateDoc(doc(db, 'reservations', reservationId), {
        startDate: editedStart,
        endDate: editedEnd,
        description: editedDescription,
        status: 'requested',        // 🔑 reset status
        updatedAt: serverTimestamp(),
      });
  
      // 2️⃣ Update local state
      setReservation({
        ...reservation,
        startDate: editedStart,
        endDate: editedEnd,
        description: editedDescription,
        status: 'requested',        // 🔑 sync local state
      });
  
      // 3️⃣ Close edit mode & notify user
      setIsEditing(false);
      Alert.alert('Updated', 'Reservation request updated and status reset to requested.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update reservation.');
    }
  };
  
  
  const toJSDate = (date: any): Date => {
    if (!date) return new Date();
    return typeof date.toDate === 'function' ? date.toDate() : date;
  };
  
  
  const handleAcceptReservation = async () => {
    if (!reservation) return;
  
    try {
      // 1. Update reservation status
      await updateStatus('confirmed');
  
      if (reservation.spaceId) {
        const start = toJSDate(reservation.startDate);
        const end = toJSDate(reservation.endDate);
      
        await addReservedTime(
          reservation.spaceId,
          start.toISOString().split('T')[0],
          end.toISOString().split('T')[0]
        );
      }
      
  
      Alert.alert('Success', 'Reservation confirmed and time added to space.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to finalize reservation.');
    }
  };

  
  const goToChat = () => {
    if (!reservation || !userId) return;
  
    const otherUserId =
      userId === reservation.requesterId ? reservation.ownerId : reservation.requesterId;
  
    const chatId = [userId, otherUserId].sort().join('_');
  
    // Navigate to the MessagesScreen inside the Chats tab
    navigation.getParent()?.navigate('Chats', {
      screen: 'MessagesScreen',
      params: { chatId, otherUserId },
    });
    
  };




  // security stuff: 

  const generateSecurityCode = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

  const handleVerifyCode = async () => {
    if (!reservation?.security) return;
  
    if (enteredCode !== reservation.security.code) {
      Alert.alert('Invalid Code', 'The security code does not match.');
      return;
    }
  
    await updateDoc(doc(db, 'reservations', reservationId), {
      'security.codeVerified': true,
    });
  
    setReservation({
      ...reservation,
      security: {
        ...reservation.security,
        codeVerified: true,
      },
    });
  
    Alert.alert('Success', 'Security code verified.');
  };

  const handleUploadSecurityPhoto = async () => {
    try {
      setUploadingImage(true);
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
  
      if (result.canceled) return;
  
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const storageRef = ref(
        storage,
        `securityPhotos/${reservationId}.jpg`
      );
  
      await uploadBytes(storageRef, blob);
      const photoUrl = await getDownloadURL(storageRef);
  
      await updateDoc(doc(db, 'reservations', reservationId), {
        'security.photoUrl': photoUrl,
        'security.photoUploaded': true,
      });
  
      setReservation({
        ...reservation,
        security: {
          ...reservation.security,
          photoUrl,
          photoUploaded: true,
        },
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (
      reservation?.security?.codeVerified &&
      reservation?.security?.photoUploaded &&
      !reservation.security.completed
    ) {
      updateDoc(doc(db, 'reservations', reservationId), {
        'security.completed': true,
      });
    }
  }, [reservation?.security]);
  

  const canConfirm = userId === reservation?.ownerId && reservation?.status === 'requested';
  const canAccept = userId === reservation?.requesterId && reservation?.status === 'awaiting_acceptance';

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (!reservation) return <Text>Reservation not found</Text>;

  return (

    <ScrollView
    contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
    >

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
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Status:</Text> {reservation.status}
        </Text>

        {!isEditing ? (
          <>
            <Text style={styles.detailText}>
              <Text style={styles.bold}>Start:</Text>{' '}
              {toJSDate(reservation.startDate).toDateString()}
            </Text>

            <Text style={styles.detailText}>
              <Text style={styles.bold}>End:</Text>{' '}
              {toJSDate(reservation.endDate).toDateString()}
            </Text>

            <Text style={styles.detailText}>
              <Text style={styles.bold}>Description:</Text>{' '}
              {reservation.description}
            </Text>

            {canEdit && (
              <Button title="Edit Request" onPress={() => setIsEditing(true)} />
            )}
          </>
        ) : (
          <>
            <BlockedCalendar
              blockedTimes={[]}          
              reservedTimes={[]}       
              onSelectRange={({ start, end }) => {
                setEditedStart(start);
                setEditedEnd(end);
              }}
            />

            <Text style={styles.bold}>Description</Text>
            <TextInput
              style={styles.input}
              value={editedDescription}
              onChangeText={setEditedDescription}
              multiline
            />

            <Button title="Save Changes" onPress={handleSaveEdit} />
            <Button title="Cancel Editing" onPress={() => setIsEditing(false)} />
          </>
        )}
      </View>


      {space && (
        <View style={styles.pricingBox}>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>{space.priceFrequency} price:</Text>{' '}
            ${Number(space.price).toFixed(2)} CAD
          </Text>

          {reservation?.status === 'confirmed' && reservation.nextPaymentDate && (
            <>
              <Text style={styles.detailText}>
                <Text style={styles.bold}>Next Payment Date:</Text>{' '}
                {reservation.nextPaymentDate.toDate().toLocaleDateString()}
              </Text>

              {role === 'host' && (() => {
                const base = Number(space.price);
                const platformFee = base * 0.095;
                const payout = base - platformFee;
                return (
                  <>
                    <Text style={styles.detailText}>
                      <Text style={styles.bold}>Platform Fee (9.5%):</Text> -${platformFee.toFixed(2)}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.bold}>Total Payout:</Text> ${payout.toFixed(2)}
                    </Text>
                  </>
                );
              })()}

              {role === 'renter' && (() => {
                const base = Number(space.price);
                const platformFee = base * 0.095;
                const totalCost = base + platformFee;
                return (
                  <>
                    <Text style={styles.detailText}>
                      <Text style={styles.bold}>Platform Fee (9.5%):</Text> +${platformFee.toFixed(2)}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.bold}>Total Cost:</Text> ${totalCost.toFixed(2)}
                    </Text>
                  </>
                );
              })()}
            </>
          )}
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

    {reservation.status === 'confirmed' && reservation.security && (
  <View style={styles.securityBox}>
    <Text style={styles.sectionTitle}>Security Check</Text>

        {/* REQUESTER VIEW */}
        {userId === reservation.requesterId && (
          <>
            <Text style={styles.securityText}>
              Share this code with the owner when placing your items.
            </Text>

            <View style={styles.codeRow}>
              {!reservation.security.codeVerified && (
                <Text style={styles.securityCode}>
                  {reservation.security.code}
                </Text>
              )}

              {reservation.security.codeVerified && (
                <Text style={styles.successText}>✅ Code Verified</Text>
              )}
            </View>



            {!reservation.security.photoUploaded && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleUploadSecurityPhoto}
                disabled={uploadingImage}
              >
                <Text style={styles.actionButtonText}>
                  Upload Storage Photo
                </Text>
              </TouchableOpacity>
            )}

            {reservation.security.photoUploaded && (
              <Text style={styles.successText}>✅ Photo uploaded</Text>
            )}
          </>
        )}

        {/* OWNER VIEW */}
        {userId === reservation.ownerId && (
          <>
            {!reservation.security.codeVerified && (
            <>
              <Text style={styles.securityText}>
                Enter the code provided by the requester:
              </Text>

              <TextInput
                style={styles.codeInput}
                value={enteredCode}
                onChangeText={setEnteredCode}
                keyboardType="number-pad"
                maxLength={4}
              />

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleVerifyCode}
              >
                <Text style={styles.actionButtonText}>Verify Code</Text>
              </TouchableOpacity>
            </>
            )}

            {reservation.security.codeVerified && (
              <Text style={styles.successText}>✅ Code verified</Text>
            )}
          </>
        )}


      </View>
    )}





    <Button title="Message User" onPress={goToChat} />
      {userId === reservation.ownerId && reservation.status === 'requested' && (
          <View style={{ marginTop: 12 }}>
            <Button
              title="Deny Request"
              color="red"
              onPress={handleDenyRequest}
            />
          </View>
      )}


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
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('RulesScreen', {
              reservationId: reservationId,
              role: 'owner',
            })
          }
        >
          <Text style={styles.actionButtonText}>Confirm Request</Text>
        </TouchableOpacity>
      )}

      {canAccept && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('RulesScreen', {
              reservationId: reservationId,
              role: 'requester',
            })
          }
        >
          <Text style={styles.actionButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      )}

    {/* </View> */}
    </ScrollView>


  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40, // 👈 important so buttons aren't cut off
    backgroundColor: '#FFFCF1',
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    minHeight: 80,
    textAlignVertical: 'top', // important for multiline
    backgroundColor: '#fff',
  },
  actionButton: {
    backgroundColor: '#0F6B5B',  // Emerald Green
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },  
  securityBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F3F7F6',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  securityText: {
    fontSize: 14,
    marginBottom: 8,
  },
  securityCode: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 6,
    textAlign: 'center',
    marginVertical: 12,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    color: '#0F6B5B',
    fontWeight: '600',
    marginTop: 8,
  },
  
  
});
