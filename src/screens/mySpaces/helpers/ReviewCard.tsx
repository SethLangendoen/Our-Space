// src/components/ReviewCard.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { doc, setDoc, updateDoc, serverTimestamp, collection, doc as docRef } from 'firebase/firestore';
import { db } from '../../../firebase/config';

type ReviewCardProps = {
	reservationId: string;
	hostId: string;
	renterId: string;
	role: 'host' | 'renter';
	securityType: 'dropOff' | 'pickUp';
	reviewerFirstName?: string;
	onReviewSubmitted: () => void;
  };
  

export default function ReviewCard({
  reservationId,
  hostId,
  renterId,
  role,
  reviewerFirstName,
  securityType,
  onReviewSubmitted,
}: ReviewCardProps) {
  const [rating, setRating] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const reviewerId = role === 'host' ? hostId : renterId;
      const revieweeId = role === 'host' ? renterId : hostId;

	  const reviewData = {
		rating,
		description,
		reviewerId,
		revieweeId,
		reviewerName: reviewerFirstName || 'User', // store only the actual first name
		reservationId,
		securityType,
		role,
		createdAt: serverTimestamp(),
	  };
	  

      // Save review in main 'reviews' collection
      const reviewDocRef = docRef(collection(db, 'reviews'));
      await setDoc(reviewDocRef, reviewData);

      // Update reservation flag
      const reservationRef = doc(db, 'reservations', reservationId);
      await updateDoc(reservationRef, {
        [`security.${securityType}.reviews.${role}`]: true,
      });

      Alert.alert('Review submitted!');
      onReviewSubmitted(); // trigger parent to refresh UI
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {role === 'host' ? 'Leave a review for the renter' : 'Leave a review for the host'}
      </Text>

      <Text style={styles.label}>Rating:</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map(num => (
          <TouchableOpacity key={num} onPress={() => setRating(num)}>
            <Text style={[styles.star, rating >= num && styles.selectedStar]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Review:</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={3}
        placeholder="Write your experience..."
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF9F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0F6B5B',
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 8,
    color: '#0F6B5B',
  },
  label: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 24,
    color: '#ccc',
    marginHorizontal: 2,
  },
  selectedStar: {
    color: '#FFD700',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#0F6B5B',
    borderRadius: 6,
    padding: 8,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0F6B5B',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
