
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { doc, setDoc, updateDoc, serverTimestamp, collection, getDoc, query, where, getDocs } from 'firebase/firestore';
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
        reviewerName: reviewerFirstName || 'User',
        reservationId,
        securityType,
        role,
        createdAt: serverTimestamp(),
      };

      // Save review **as a subcollection under the reviewee**
      const reviewDocRef = doc(collection(db, 'users', revieweeId, 'reviews'));
      await setDoc(reviewDocRef, reviewData);

      // ⭐ 5-Star Streak Logic
    if (rating === 5) {
      const revieweeRef = doc(db, 'users', revieweeId);
      const revieweeSnap = await getDoc(revieweeRef);

      if (revieweeSnap.exists()) {
        const revieweeData = revieweeSnap.data();
        const badges = revieweeData.badges || {};

        // Only proceed if badge is currently false
        if (!badges['5StarStreak'] || !badges['allStarTier']) {
          const reviewsRef = collection(db, 'users', revieweeId, 'reviews');

          // Count existing 5-star reviews
          const fiveStarQuery = query(reviewsRef, where('rating', '==', 5));
          const fiveStarSnap = await getDocs(fiveStarQuery);

          // +1 because the current review was just added
          if (fiveStarSnap.size >= 3) {
            await updateDoc(revieweeRef, {
              'badges.5StarStreak': true,
            });
          }
          if (fiveStarSnap.size >= 10) {
            await updateDoc(revieweeRef, {
              'badges.allStarTier': true,
            });
          }

        }
        
      }
    }


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

      {/* <Text style={styles.label}>Rating:</Text> */}
      <View style={styles.ratingRow}>
        <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(num => (
          <TouchableOpacity key={num} onPress={() => setRating(num)}>
            <Text style={[styles.star, rating >= num && styles.selectedStar]}>★</Text>
          </TouchableOpacity>
        ))}
        </View>
        {rating > 0 && (
          <Text style={{ marginBottom: 0, color: '#777', fontSize: 24 }}>
            {rating} / 5
          </Text>
        )}
      </View>

      {/* <Text style={styles.label}>Review:</Text> */}
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

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: '#FFF9F0',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#0F6B5B',
//   },
//   title: {
//     fontWeight: '700',
//     fontSize: 14,
//     marginBottom: 8,
//     color: '#0F6B5B',
//   },
//   label: {
//     fontSize: 13,
//     marginTop: 8,
//     marginBottom: 4,
//     color: '#333',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   star: {
//     fontSize: 24,
//     color: '#ccc',
//     marginHorizontal: 2,
//   },
//   selectedStar: {
//     color: '#FFD700',
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: '#0F6B5B',
//     borderRadius: 6,
//     padding: 8,
//     textAlignVertical: 'top',
//   },
//   submitButton: {
//     backgroundColor: '#0F6B5B',
//     paddingVertical: 10,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   submitButtonText: {
//     color: '#FFF',
//     fontWeight: '600',
//   },
// });

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F6B5B',
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },

  ratingRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  stars: {
    flexDirection: 'row'
  },

  star: {
    fontSize: 32,
    color: '#DADADA',
    marginRight: 6,
  },

  selectedStar: {
    color: '#FFD700',
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
  },

  submitButton: {
    marginTop: 14,
    backgroundColor: '#0F6B5B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
