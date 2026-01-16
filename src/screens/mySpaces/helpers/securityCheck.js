

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebase/config';
import ReviewCard from './ReviewCard'; // make sure you have a ReviewCard component

export default function SecurityCheck({ reservation, reservationId, userId, type, role }) {
  const [enteredCode, setEnteredCode] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localSecurity, setLocalSecurity] = useState(reservation.security[type]);

  // Local state to re-render when reservation updates
  useEffect(() => {
    setLocalSecurity(reservation.security[type]);
  }, [reservation.security, type]);

  // Pick-up is locked until drop-off is completed
  const dropOffCompleted = reservation.security?.dropOff?.codeVerified && reservation.security?.dropOff?.photoUploaded;
  const isPickUpLocked = type === 'pickUp' && !dropOffCompleted;

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

  // Determine if we should show review form
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
          Pick-up check will be available after drop-off is completed.
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
      {showReviewForm && (

        // <ReviewCard
        //   reservationId={reservationId}
        //   hostId={reservation.ownerId}
        //   renterId={reservation.requesterId}
        //   role={role} // current user role
        //   securityType={type} // pass dropOff or pickUp so ReviewCard knows where to save
        //   onReviewSubmitted={review => {
        //     // update local security reviews immediately
        //     setLocalSecurity(prev => ({
        //       ...prev,
        //       reviews: {
        //         ...prev.reviews,
        //         [role]: review, // host or renter
        //       },
        //     }));
        //   }}
        // />
        <ReviewCard
  reservationId={reservationId}
  hostId={reservation.ownerId}
  renterId={reservation.requesterId}
  role={role} // current user role
  securityType={type} // pass dropOff or pickUp so ReviewCard knows where to save
  onReviewSubmitted={() => {
    // Update local state immediately to show "Review submitted" check
    setLocalSecurity(prev => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [role]: true, // mark host or renter review as done
      },
    }));
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
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFFCF1',
    borderWidth: 1,
    borderColor: '#0F6B5B',
  },
  lockedContainer: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    color: '#0F6B5B',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0F6B5B',
  },
  successText: {
    color: 'green',
    fontWeight: '600',
    marginVertical: 4,
  },
  actionButton: {
    backgroundColor: '#0F6B5B',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#0F6B5B',
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
    width: 80,
    textAlign: 'center',
  },
  lockedText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 6,
  },
});
