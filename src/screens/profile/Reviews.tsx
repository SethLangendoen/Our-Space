

// // import React, { useEffect, useState } from 'react';
// // import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// // import { collection, getDocs } from 'firebase/firestore';
// // import { db } from '../../firebase/config'; // adjust path if needed

// // interface Review {
// //   securityType: string;
// //   id: string;
// //   reviewerName?: string;
// //   rating: number;
// //   description?: string;
// //   createdAt?: any; // Firestore Timestamp
// // }

// // interface ReviewsProps {
// //   activeTab: string;
// //   viewingUserId: string | undefined;
// // }

// // export default function Reviews({ activeTab, viewingUserId }: ReviewsProps) {
// //   const [reviews, setReviews] = useState<Review[]>([]);
// //   const [loadingReviews, setLoadingReviews] = useState(false);

// //   useEffect(() => {
// //     if (activeTab !== 'Reviews' || !viewingUserId) return; // only fetch when tab is active and userId exists

// //     const fetchReviews = async () => {
// //       setLoadingReviews(true);
// //       try {
// //         // Fetch from the subcollection of the user
// //         const reviewsCollectionRef = collection(db, 'users', viewingUserId, 'reviews');
// //         const querySnapshot = await getDocs(reviewsCollectionRef);

// //         const fetchedReviews = querySnapshot.docs.map(doc => ({
// //           id: doc.id,
// //           ...doc.data(),
// //         })) as Review[];

// //         // Optional: sort newest first
// //         fetchedReviews.sort((a, b) => {
// //           const aTime = a.createdAt?.seconds || 0;
// //           const bTime = b.createdAt?.seconds || 0;
// //           return bTime - aTime;
// //         });

// //         setReviews(fetchedReviews);
// //       } catch (err) {
// //         console.error('Failed to fetch reviews', err);
// //       } finally {
// //         setLoadingReviews(false);
// //       }
// //     };

// //     fetchReviews();
// //   }, [activeTab, viewingUserId]);

// //   const getOrdinal = (n: number) => {
// //     if (n > 3 && n < 21) return 'th'; // 4-20 always 'th'
// //     switch (n % 10) {
// //       case 1: return 'st';
// //       case 2: return 'nd';
// //       case 3: return 'rd';
// //       default: return 'th';
// //     }
// //   };
// //   const formatReviewDate = (date: Date) => {
// //     const month = date.toLocaleString('default', { month: 'long' }); // "January"
// //     const day = date.getDate(); // 26
// //     const year = date.getFullYear(); // 2026
// //     return `${month} ${day}${getOrdinal(day)}, ${year}`;
// //   };
    


// //   const StarRating = ({ rating }: { rating: number }) => (
// //     <View style={{ flexDirection: 'row', marginVertical: 4 }}>
// //       {Array.from({ length: 5 }).map((_, i) => (
// //         <Text
// //           key={i}
// //           style={{
// //             fontSize: 18,
// //             color: i < rating ? '#FFD700' : '#CCC',
// //             marginRight: 2,
// //           }}
// //         >
// //           ★
// //         </Text>
// //       ))}
// //     </View>
// //   );

// //   const formatSecurityType = (review: { securityType: string }) => {
// //     if (review.securityType === 'pickUp') return 'Pick-Up';
// //     if (review.securityType === 'dropOff') return 'Drop-Off';
// //     return review.securityType; // fallback
// //   };
  

// //   return (
// //     <View style={styles.container}>
// //       {loadingReviews ? (
// //         <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
// //       ) : reviews.length > 0 ? (
// //         reviews.map((review) => {
// //           const createdAtDate = review.createdAt
// //             ? new Date(review.createdAt.seconds * 1000)
// //             : null;

// //           return (
// //             <View key={review.id} style={styles.reviewCard}>
// //               <View style={styles.reviewHeader}>
// //                 <Text style={styles.reviewerName}>
// //                   {review.reviewerName || 'User'}{' '}
// //                   <Text style={styles.saysText}>{formatSecurityType(review)}</Text>
// //                 </Text>
// //                 <StarRating rating={review.rating} />
// //               </View>

// //               {review.description && (
// //               <Text style={styles.reviewText}>
// //                 {review.description}
// //               </Text>
// //               )}

// //               {createdAtDate && (
// //                 <Text style={styles.reviewDate}>
// //                   {formatReviewDate(createdAtDate)}
// //                 </Text>
// //               )}

// //             </View>
// //           );
// //         })
// //       ) : (
// //         <Text style={styles.message}>No reviews yet.</Text>
// //       )}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     paddingTop: 10,
// //     paddingHorizontal: 0, // remove horizontal padding
// //   },
  

// //   reviewCard: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     padding: 12,
// //     marginBottom: 12,
// //     shadowColor: '#000',
// //     shadowOpacity: 0.05,
// //     shadowRadius: 5,
// //     shadowOffset: { width: 0, height: 2 },
// //     elevation: 2,
// //     width: '100%', 
// //   },
  
// //   reviewHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 6,
// //   },
// //   reviewerName: {
// //     fontWeight: 'bold',
// //     fontSize: 14,
// //   },
// //   saysText: {
// //     fontWeight: 'normal',
// //     fontSize: 14,
// //     color: '#555',
// //   },
// //   reviewText: {
// //     fontSize: 13,
// //     color: '#333',
// //     marginBottom: 6,
// //   },
// //   reviewDate: {
// //     fontSize: 11,
// //     color: '#999',
// //   },
// //   message: {
// //     textAlign: 'center',
// //     marginTop: 20,
// //     color: '#555',
// //   },
// // });







// import React, { useEffect, useState } from 'react';
// import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../../firebase/config';

// interface Review {
//   securityType: string;
//   id: string;
//   reviewerName?: string;
//   rating: number;
//   description?: string;
//   createdAt?: any; // Firestore Timestamp
// }

// interface ReviewsProps {
//   activeTab: string;
//   viewingUserId: string | undefined;
// }

// export default function Reviews({ activeTab, viewingUserId }: ReviewsProps) {
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [loadingReviews, setLoadingReviews] = useState(false);
//   const [showAll, setShowAll] = useState(false);

//   useEffect(() => {
//     if (activeTab !== 'Reviews' || !viewingUserId) return;

//     const fetchReviews = async () => {
//       setLoadingReviews(true);
//       try {
//         const reviewsCollectionRef = collection(db, 'users', viewingUserId, 'reviews');
//         const querySnapshot = await getDocs(reviewsCollectionRef);

//         let fetchedReviews = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as Review[];

//         // Sort by rating, descending
//         fetchedReviews.sort((a, b) => b.rating - a.rating);

//         setReviews(fetchedReviews);
//       } catch (err) {
//         console.error('Failed to fetch reviews', err);
//       } finally {
//         setLoadingReviews(false);
//       }
//     };

//     fetchReviews();
//   }, [activeTab, viewingUserId]);

//   const getOrdinal = (n: number) => {
//     if (n > 3 && n < 21) return 'th';
//     switch (n % 10) {
//       case 1: return 'st';
//       case 2: return 'nd';
//       case 3: return 'rd';
//       default: return 'th';
//     }
//   };

//   const formatReviewDate = (date: Date) => {
//     const month = date.toLocaleString('default', { month: 'long' });
//     const day = date.getDate();
//     const year = date.getFullYear();
//     return `${month} ${day}${getOrdinal(day)}, ${year}`;
//   };

//   const StarRating = ({ rating }: { rating: number }) => (
//     <View style={{ flexDirection: 'row', marginVertical: 4 }}>
//       {Array.from({ length: 5 }).map((_, i) => (
//         <Text
//           key={i}
//           style={{
//             fontSize: 16,
//             color: i < rating ? '#FFD700' : '#E0E0E0',
//             marginRight: 2,
//           }}
//         >
//           ★
//         </Text>
//       ))}
//     </View>
//   );

//   const formatSecurityType = (review: { securityType: string }) => {
//     if (review.securityType === 'pickUp') return 'Pick-Up';
//     if (review.securityType === 'dropOff') return 'Drop-Off';
//     return review.securityType;
//   };

//   // Determine which reviews to show
//   const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

//   return (
//     <View style={styles.container}>
//       {loadingReviews ? (
//         <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
//       ) : reviews.length > 0 ? (
//         <>
//           <ScrollView>
//             {displayedReviews.map((review) => {
//               const createdAtDate = review.createdAt
//                 ? new Date(review.createdAt.seconds * 1000)
//                 : null;

//               return (
//                 <View key={review.id} style={styles.reviewCard}>
//                   <View style={styles.reviewHeader}>
//                     <Text style={styles.reviewerName}>
//                       {review.reviewerName || 'User'}{' '}
//                       <Text style={styles.saysText}>{formatSecurityType(review)}</Text>
//                     </Text>
//                     <StarRating rating={review.rating} />
//                   </View>

//                   {review.description && (
//                     <Text style={styles.reviewText}>{review.description}</Text>
//                   )}

//                   {createdAtDate && (
//                     <Text style={styles.reviewDate}>
//                       {formatReviewDate(createdAtDate)}
//                     </Text>
//                   )}
//                 </View>
//               );
//             })}
//           </ScrollView>

//           {!showAll && reviews.length > 5 && (
//             <TouchableOpacity onPress={() => setShowAll(true)} style={styles.showAllButton}>
//               <Text style={styles.showAllText}>Show All Reviews</Text>
//             </TouchableOpacity>
//           )}
//         </>
//       ) : (
//         <Text style={styles.message}>No reviews yet.</Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     paddingVertical: 10,
//   },
//   reviewCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.06,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//     elevation: 3,
//   },
//   reviewHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   reviewerName: {
//     fontWeight: '600',
//     fontSize: 14,
//     color: '#222',
//   },
//   saysText: {
//     fontWeight: '400',
//     fontSize: 14,
//     color: '#555',
//   },
//   reviewText: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 6,
//     lineHeight: 20,
//   },
//   reviewDate: {
//     fontSize: 12,
//     color: '#999',
//   },
//   message: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: '#555',
//   },
//   showAllButton: {
//     marginTop: 6,
//     paddingVertical: 8,
//     alignItems: 'center',
//   },
//   showAllText: {
//     color: '#0F6B5B',
//     fontWeight: '600',
//   },
// });

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (activeTab !== 'Reviews' || !viewingUserId) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const reviewsCollectionRef = collection(db, 'users', viewingUserId, 'reviews');
        const querySnapshot = await getDocs(reviewsCollectionRef);

        let fetchedReviews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[];

        // Sort by rating, descending
        fetchedReviews.sort((a, b) => b.rating - a.rating);

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
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const formatReviewDate = (date: Date) => {
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}${getOrdinal(day)}, ${year}`;
  };

  const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
    <View style={{ flexDirection: 'row', marginVertical: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text
          key={i}
          style={{
            fontSize: size,
            color: i < rating ? '#FFD700' : '#E0E0E0',
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
    return review.securityType;
  };

  // Determine which reviews to show
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <View style={styles.container}>
      {loadingReviews ? (
        <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
      ) : reviews.length > 0 ? (
        <>
          {/* Average Rating */}
          <View style={styles.averageContainer}>
            <Text style={styles.averageText}>{averageRating.toFixed(1)}/5</Text>
            <StarRating rating={Math.round(averageRating)} size={18} />
            <Text style={styles.totalReviewsText}>({reviews.length} reviews)</Text>
          </View>

          <ScrollView>
            {displayedReviews.map((review) => {
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
                    <Text style={styles.reviewText}>{review.description}</Text>
                  )}

                  {createdAtDate && (
                    <Text style={styles.reviewDate}>
                      {formatReviewDate(createdAtDate)}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {!showAll && reviews.length > 5 && (
            <TouchableOpacity onPress={() => setShowAll(true)} style={styles.showAllButton}>
              <Text style={styles.showAllText}>Show All Reviews</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={styles.message}>No reviews yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  averageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  averageText: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 6,
    color: '#222',
  },
  totalReviewsText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
  },
  saysText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#555',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  showAllButton: {
    marginTop: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  showAllText: {
    color: '#0F6B5B',
    fontWeight: '600',
  },
});