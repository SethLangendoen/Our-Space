

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';

type Props = {
  reservationId: string;
  hostId: string;
  renterId: string;
  role: 'host' | 'renter'; // role of current user
};

const STAR_COUNT = 5;
const MIN_REVIEW_LENGTH = 50;
const MAX_REVIEW_LENGTH = 300;

export default function ReviewCard({
  reservationId,
  hostId,
  renterId,
  role,
}: Props) {
  const user = auth.currentUser;
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewerName, setReviewerName] = useState<string>('Anonymous');

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setReviewerName(data.firstName || 'Anonymous');
      }
    };
    fetchUser();
  }, []);

  if (!user) return null;

  const revieweeId = role === 'host' ? renterId : hostId; // who receives the review
  const reviewId = `${reservationId}_${user.uid}`;

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Please select a rating');
      return;
    }

    if (description.trim().length < MIN_REVIEW_LENGTH) {
      Alert.alert(
        'Review too short',
        `Please write at least ${MIN_REVIEW_LENGTH} characters.`
      );
      return;
    }

    if (description.length > MAX_REVIEW_LENGTH) {
      Alert.alert(
        'Review too long',
        `Please keep your review under ${MAX_REVIEW_LENGTH} characters.`
      );
      return;
    }

    try {
      setLoading(true);

      // Save review under reviewee's subcollection
      await setDoc(doc(db, 'users', revieweeId, 'reviews', reviewId), {
        reservationId,
        reviewerId: user.uid,
        reviewerName,
        revieweeId,
        hostId,
        renterId,
        role,
        rating,
        description,
        createdAt: serverTimestamp(),
      });

      // Mark the reservation as reviewed for this user
      const reviewField = role === 'host' ? 'security.reviews.host' : 'security.reviews.renter';
      await updateDoc(doc(db, 'reservations', reservationId), {
        [reviewField]: true,
      });

      setSubmitted(true);
      Alert.alert('Review submitted');
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return !submitted ? (
    <View style={styles.card}>
      <Text style={styles.title}>Leave a Review</Text>

      <View style={styles.stars}>
        {Array.from({ length: STAR_COUNT }).map((_, i) => {
          const value = i + 1;
          return (
            <TouchableOpacity key={value} onPress={() => setRating(value)}>
              <Text style={value <= rating ? styles.starActive : styles.star}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Share your experience..."
        value={description}
        onChangeText={text => {
          if (text.length <= MAX_REVIEW_LENGTH) setDescription(text);
        }}
        multiline
      />
      <Text
        style={[
          styles.charCount,
          description.length < MIN_REVIEW_LENGTH && styles.charCountError,
        ]}
      >
        {description.length}/{MAX_REVIEW_LENGTH}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={submitReview}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    fontSize: 32,
    color: '#ccc',
    marginRight: 4,
  },
  starActive: {
    fontSize: 32,
    color: '#FFD700',
    marginRight: 4,
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  charCountError: {
    color: '#D32F2F',
  },
});
