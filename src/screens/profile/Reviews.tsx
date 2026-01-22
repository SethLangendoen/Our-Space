

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config'; // adjust path if needed

interface Review {
  securityType: string;
  id: string;
  reviewerName?: string;
  rating: number;
  description?: string;
  createdAt?: any; // Firestore Timestamp
}

interface ReviewsProps {
  activeTab: string;
  viewingUserId: string | undefined;
}

export default function Reviews({ activeTab, viewingUserId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (activeTab !== 'Reviews' || !viewingUserId) return; // only fetch when tab is active and userId exists

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        // Fetch from the subcollection of the user
        const reviewsCollectionRef = collection(db, 'users', viewingUserId, 'reviews');
        const querySnapshot = await getDocs(reviewsCollectionRef);

        const fetchedReviews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[];

        // Optional: sort newest first
        fetchedReviews.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setReviews(fetchedReviews);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [activeTab, viewingUserId]);

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return 'th'; // 4-20 always 'th'
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  const formatReviewDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'long' }); // "January"
    const day = date.getDate(); // 26
    const year = date.getFullYear(); // 2026
    return `${month} ${day}${getOrdinal(day)}, ${year}`;
  };
    


  const StarRating = ({ rating }: { rating: number }) => (
    <View style={{ flexDirection: 'row', marginVertical: 4 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text
          key={i}
          style={{
            fontSize: 18,
            color: i < rating ? '#FFD700' : '#CCC',
            marginRight: 2,
          }}
        >
          ★
        </Text>
      ))}
    </View>
  );

  const formatSecurityType = (review: { securityType: string }) => {
    if (review.securityType === 'pickUp') return 'Pick-Up';
    if (review.securityType === 'dropOff') return 'Drop-Off';
    return review.securityType; // fallback
  };
  

  return (
    <View style={styles.container}>
      {loadingReviews ? (
        <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
      ) : reviews.length > 0 ? (
        reviews.map((review) => {
          const createdAtDate = review.createdAt
            ? new Date(review.createdAt.seconds * 1000)
            : null;

          return (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>
                  {review.reviewerName || 'User'}{' '}
                  <Text style={styles.saysText}>{formatSecurityType(review)}</Text>
                </Text>
                <StarRating rating={review.rating} />
              </View>

              {review.description && (
              <Text style={styles.reviewText}>
                {review.description}
              </Text>
              )}

              {createdAtDate && (
                <Text style={styles.reviewDate}>
                  {formatReviewDate(createdAtDate)}
                </Text>
              )}

            </View>
          );
        })
      ) : (
        <Text style={styles.message}>No reviews yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 0, // remove horizontal padding
  },
  

  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: '100%', 
  },
  
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  saysText: {
    fontWeight: 'normal',
    fontSize: 14,
    color: '#555',
  },
  reviewText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
});
