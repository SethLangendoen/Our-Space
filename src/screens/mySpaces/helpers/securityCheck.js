
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase/config';
import ReviewCard from './ReviewCard';

export default function SecurityCheck({ reservation, reservationId, userId, type, role }) {
  const [enteredCode, setEnteredCode] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localSecurity, setLocalSecurity] = useState(reservation.security[type]);
  const [reviewerFirstName, setReviewerFirstName] = useState('');

  // Fetch current user's first name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setReviewerFirstName(userDoc.data().firstName || '');
        }
      } catch (err) {
        console.error('Failed to fetch user first name:', err);
      }
    };

    fetchUserName();
  }, [userId]);

  // Re-render local security when reservation updates
  useEffect(() => {
    setLocalSecurity(reservation.security[type]);
  }, [reservation.security, type]);

  const now = new Date();
  const reservationEnd =
  reservation.endDate
    ? reservation.endDate.toDate
      ? reservation.endDate.toDate() // Firestore Timestamp
      : new Date(reservation.endDate) // ISO / string
    : null;
    const hoursUntilEnd =
    reservationEnd
      ? (reservationEnd.getTime() - now.getTime()) / (1000 * 60 * 60)
      : null;
  
// Pick-up is locked if drop-off not complete OR less than 48 hours before end date
  const dropOffCompleted =
    reservation.security?.dropOff?.codeVerified &&
    reservation.security?.dropOff?.photoUploaded;

  const isPickUpLocked =
    type === 'pickUp' &&
    (
      !dropOffCompleted ||
      hoursUntilEnd === null || // 🔒 TBD = locked
      hoursUntilEnd > 48
    );
  
    const getBookingDurationMs = (startDate, completedAt) => {
      const start =
        startDate?.toDate ? startDate.toDate() : new Date(startDate);
    
      return completedAt.getTime() - start.getTime();
    };
    

// used for the respected royalty badge
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;


const maybeMarkReservationCompleted = async (updatedSecurity) => {
  const pickUp = updatedSecurity?.pickUp;

  const isPickUpComplete =
    pickUp?.codeVerified &&
    pickUp?.photoUploaded &&
    pickUp?.reviews?.host &&
    pickUp?.reviews?.renter;

  if (!isPickUpComplete) return;

  const reservationRef = doc(db, 'reservations', reservationId);
  const spaceRef = doc(db, 'spaces', reservation.spaceId);

  try {
    await runTransaction(db, async (transaction) => {
      // ---- ALL READS FIRST ----
      const reservationSnap = await transaction.get(reservationRef);
      if (!reservationSnap.exists()) return;
    
      const reservationData = reservationSnap.data();
      if (reservationData.status === 'completed') return;
    
      const spaceSnap = await transaction.get(spaceRef);
      if (!spaceSnap.exists()) return;
    
      const spaceData = spaceSnap.data();
    
      const hostRef = doc(db, 'users', reservationData.ownerId);
      const renterRef = doc(db, 'users', reservationData.requesterId);
    
      const hostSnap = await transaction.get(hostRef);
      if (!hostSnap.exists()) return;
    
      const renterSnap = await transaction.get(renterRef);
      if (!renterSnap.exists()) return;
    
      const hostData = hostSnap.data();
      const renterData = renterSnap.data();
    
      // ---- COMPUTE ----
      const completedAt = new Date();
    
      const bookingDurationMs = reservationData.endDate.toDate().getTime() - reservationData.startDate.toDate().getTime();

      const qualifiesFor30DayStreak = bookingDurationMs >= THIRTY_DAYS_MS;
    
      const currentTotal = spaceData.totalTimeBooked || 0;
    
      const updatedReservedTimes = (spaceData.reservedTimes || []).filter((rt) => {
        const rtStart = rt.startDate.toDate?.() || new Date(rt.startDate);
        const rtEnd = rt.endDate.toDate?.() || new Date(rt.endDate);
    
        return !(
          rt.renterId === reservationData.requesterId &&
          rtStart.getTime() === reservationData.startDate.toDate().getTime() &&
          rtEnd.getTime() === reservationData.endDate.toDate().getTime()
        );
      });
    
      // ---- BADGE LOGIC ----
      const renterCompletedAsRenter =
        (renterData.completedAsRenter || 0) + 1;
    
      const hostCompletedAsHost =
        (hostData.completedAsHost || 0) + 1;
    
      const renterTotal =
        renterCompletedAsRenter + (renterData.completedAsHost || 0);
    
      const hostTotal =
        hostCompletedAsHost + (hostData.completedAsRenter || 0);
    
      const renterQualifies = renterTotal >= 5;
      const hostQualifies = hostTotal >= 5;

      // ---- WRITES LAST ----
      transaction.update(reservationRef, {
        status: 'completed',
        completedAt,
      });
    
      transaction.update(spaceRef, {
        totalTimeBooked: currentTotal + bookingDurationMs,
        reservedTimes: updatedReservedTimes,
        activeReservationId: null,
        isPublic: true,
      });
    
    
      transaction.update(renterRef, {
        completedAsRenter: renterCompletedAsRenter,
        'badges.5XSpacer': renterQualifies,
        ...(qualifiesFor30DayStreak &&
          !renterData?.badges?.['30DayStreak'] && {
            'badges.30DayStreak': true,
          }),
      });

      transaction.update(hostRef, {
        completedAsHost: hostCompletedAsHost,
        'badges.5XSpacer': hostQualifies,
        ...(qualifiesFor30DayStreak &&
          !hostData?.badges?.['30DayStreak'] && {
            'badges.30DayStreak': true,
          }),
      });

    });


    console.log('Reservation marked completed and reserved time removed.');
  } catch (err) {
    console.error('Failed to complete reservation:', err);
  }
};

    

    const handleVerifyCode = async () => {
    if (enteredCode !== localSecurity.code) {
      Alert.alert('Invalid Code', 'The security code does not match.');
      return;
    }

    try {
      await updateDoc(doc(db, 'reservations', reservationId), {
        [`security.${type}.codeVerified`]: true,
        [`security.${type}.reviews`]: localSecurity?.reviews || { host: null, renter: null },
      });

      setLocalSecurity(prev => ({ ...prev, codeVerified: true }));
      Alert.alert('Success', 'Security code verified.');
    } catch (err) {
      Alert.alert('Error', 'Failed to verify code.');
    }
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

      const storageRef = ref(storage, `securityPhotos/${reservationId}-${type}.jpg`);
      await uploadBytes(storageRef, blob);
      const photoUrl = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'reservations', reservationId), {
        [`security.${type}.photoUrl`]: photoUrl,
        [`security.${type}.photoUploaded`]: true,
        [`security.${type}.reviews`]: localSecurity?.reviews || { host: null, renter: null },
      });

      setLocalSecurity(prev => ({ ...prev, photoUploaded: true, photoUrl }));
    } catch (err) {
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };



  const showReviewForm =
    localSecurity?.codeVerified &&
    localSecurity?.photoUploaded &&
    ((userId === reservation.ownerId && !localSecurity.reviews?.host) ||
    (userId === reservation.requesterId && !localSecurity.reviews?.renter));

  return (
    <View style={[styles.container, isPickUpLocked && styles.lockedContainer]}>
      <Text style={styles.title}>
        {type === 'dropOff' ? 'Drop-off Security Check' : 'Pick-up Security Check'}
      </Text>

      {isPickUpLocked && (
        <Text style={styles.lockedText}>
          Pick-up check will be available 48 hours prior to the end date, and after drop-off is completed.
        </Text>
      )}

      {/* REQUESTER VIEW */}
      {userId === reservation.requesterId && !isPickUpLocked && (
        <>
          <Text style={styles.infoText}>
            {`Arrange a time with the host to ${type === 'dropOff' ? 'dropoff' : 'pickup'} your items.`}
          </Text>

          {!localSecurity.codeVerified && (
            <Text style={styles.codeText}>Share this code with the owner: {localSecurity.code}</Text>
          )}
          {localSecurity.codeVerified && <Text style={styles.successText}>✅ Code Verified</Text>}

          {!localSecurity.photoUploaded && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUploadSecurityPhoto}
              disabled={uploadingImage}
            >
              <Text style={styles.actionButtonText}>Upload Storage Photo</Text>
            </TouchableOpacity>
          )}
          {localSecurity.photoUploaded && <Text style={styles.successText}>✅ Photo uploaded</Text>}
        </>
      )}

      {/* OWNER VIEW */}
      {userId === reservation.ownerId && !isPickUpLocked && (
        <>
          {!localSecurity.codeVerified && (
            <>
              <Text style={styles.infoText}>Enter the code provided by the requester:</Text>
              <TextInput
                style={styles.codeInput}
                value={enteredCode}
                onChangeText={setEnteredCode}
                keyboardType="number-pad"
                maxLength={4}
              />
              <TouchableOpacity style={styles.actionButton} onPress={handleVerifyCode}>
                <Text style={styles.actionButtonText}>Verify Code</Text>
              </TouchableOpacity>
            </>
          )}
          {localSecurity.codeVerified && <Text style={styles.successText}>✅ Code Verified</Text>}
        </>
      )}

      {/* REVIEW FORM */}
      {showReviewForm && reviewerFirstName && (
        <ReviewCard
          reservationId={reservationId}
          hostId={reservation.ownerId}
          renterId={reservation.requesterId}
          role={role}
          securityType={type}
          reviewerFirstName={reviewerFirstName} // now fetched from Firestore
          onReviewSubmitted={async () => {
            const updatedSecurity = {
              ...localSecurity,
              reviews: { ...localSecurity.reviews, [role]: true },
            };
          
            setLocalSecurity(updatedSecurity);
          
            if (type === 'pickUp') {
              await maybeMarkReservationCompleted({
                ...reservation.security,
                pickUp: updatedSecurity,
              });
            }
          }}
          

        />
      )}

      {/* REVIEW STATUS */}
      {localSecurity.reviews?.host && userId === reservation.ownerId && (
        <Text style={styles.successText}>✅ Review submitted</Text>
      )}
      {localSecurity.reviews?.renter && userId === reservation.requesterId && (
        <Text style={styles.successText}>✅ Review submitted</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  lockedContainer: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },

  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#0F6B5B',
    marginBottom: 12,
  },

  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 20,
  },

  codeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'center',
    color: '#0F6B5B',
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
  },

  successText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#10B981',
    marginTop: 6,
  },

  actionButton: {
    backgroundColor: '#0F6B5B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  actionButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  codeInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 10,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    letterSpacing: 4,
    marginVertical: 10,
    width: 120,
    alignSelf: 'center',
    backgroundColor: '#F9FAFB',
  },

  lockedText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 18,
  },
});
