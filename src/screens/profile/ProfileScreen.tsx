import { setDoc, serverTimestamp } from 'firebase/firestore';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, useIsFocused, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, db } from '../../firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import SpaceCard from '../../components/SpaceCard';
const { height: screenHeight } = Dimensions.get('window');
const { width } = Dimensions.get('window');
const verifiedBadge = '../../../assets/badges/complete/verifiedBadge.png'


type ProfileStackParamList = {
  ProfileMain: { userId?: string };
  EditProfile: undefined;
  SpaceDetail: { spaceId: string };
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ProfileMain'
>;

const StarRating = ({ rating }: { rating: number }) => {
  return (
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
};


export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'Listings' | 'Reviews' | 'Badges'>('Listings');
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'ProfileMain'>>();
  const isFocused = useIsFocused();

  const viewingUserId = route.params?.userId ?? auth.currentUser?.uid;
  const isOwnProfile = viewingUserId === auth.currentUser?.uid;

  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  

  const badgeList = [
    {
      id: '5StarStreak',
      title: '5 Star Streak',
      description: 'Maintain 5-star reviews for 5 consecutive stays.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/5StarStreak.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/5StarStreak.png'),
    },
    {
      id: '10XHost',
      title: '10X Host',
      description: 'Host 10 unique guests on your listings.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/10XHost.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/10XHost.png'),
    },
    {
      id: '100DayMVP',
      title: '100 Day MVP',
      description: 'Be active on the platform for 100 days.',
      isCompleted: true,
      iconCompleted: require('../../../assets/badges/complete/100DayMVP.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/100DayMVP.png'),
    },
    {
      id: 'firstHost',
      title: 'First Host',
      description: 'Successfully host your first guest.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/firstHost.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/firstHost.png'),
    },
    {
      id: 'firstStash',
      title: 'First Stash',
      description: 'Complete your first stash listing.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/firstStash.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/firstStash.png'),
    },
    {
      id: 'fullHouse',
      title: 'Full House',
      description: 'Have 100% occupancy for a full week.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/fullHouse.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/fullHouse.png'),
    },
    {
      id: 'respectedRoyalty',
      title: 'Respected Royalty',
      description: 'Earn the respect of fellow hosts and guests.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/respectedRoyalty.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/respectedRoyalty.png'),
    },
    {
      id: 'socialStar',
      title: 'Social Star',
      description: 'Engage actively on social platforms.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/socialStar.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/socialStar.png'),
    },
    {
      id: 'speedyReplier',
      title: 'Speedy Replier',
      description: 'Respond to guest inquiries in under an hour.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/speedyReplier.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/speedyReplier.png'),
    },
    {
      id: 'verifiedHero',
      title: 'Verified Hero',
      description: 'Verify your identity and payment method.',
      isCompleted: false,
      iconCompleted: require('../../../assets/badges/complete/verifiedHero.png'),
      iconIncomplete: require('../../../assets/badges/incomplete/verifiedHero.png'),
    },
  ];



  
  const fetchUserData = async () => {
    if (!viewingUserId) return;
    setLoading(true);
  
    try {
      const userRef = doc(db, 'users', viewingUserId);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          firstName: auth.currentUser?.displayName || '',
          lastName: '',
          bio: '',
          profileImage: auth.currentUser?.photoURL || null,
          createdAt: serverTimestamp(),
        });
      }
  
      // Now fetch the document (whether it existed or we just created it)
      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        const data = updatedSnap.data();
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        setName(fullName || 'No Name');
        setBio(data.bio || '');
        setProfileImage(data.profileImage || null);
  
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
          setCreatedAt(formattedDate);
          console.log("Member since:", formattedDate);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };





  const fetchUserListings = async () => {
    if (!viewingUserId) return;
    try {
      const q = query(collection(db, 'spaces'), where('userId', '==', viewingUserId));
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(posts);
    } catch (error) {
      console.error('Error fetching user listings:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
      fetchUserListings();
      fetchVerificationStatus();
    }
  }, [isFocused]);

  useEffect(() => {
    if (activeTab !== 'Reviews') return; // only fetch when Reviews tab is active
  
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const q = query(
          collection(db, 'reviews'),
          where('revieweeId', '==', viewingUserId) // 👈 use viewingUserId
        );
        const querySnapshot = await getDocs(q);
        const fetchedReviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(fetchedReviews);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    };
  
    fetchReviews();
  }, [activeTab, viewingUserId]);
  

  const fetchVerificationStatus = async () => {
    if (!viewingUserId) return;
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      const response = await fetch(
        "https://us-central1-our-space-8b8cd.cloudfunctions.net/checkStripeVerification",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsVerified(data.verified);
      } else {
        console.warn("Error fetching verification:", data.error);
      }
    } catch (error) {
      console.error("Error fetching verification:", error);
    }
  };
  





  if (loading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" />
      </View>
    );
  }



  const updatedBadgeList = badgeList.map((badge) => {
    if (badge.id === "verifiedHero") {
      return { ...badge, isCompleted: isVerified };
    }
    return badge;
  });



  return (
    <ScrollView 
    style={styles.scrollView} 
    contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>10</Text>
              <Text style={styles.statLabel}>Space Badges</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileContainer}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../../assets/blankProfile.png')}
            style={styles.profileImage}
          />




          <Text style={styles.name}>{name}</Text>
          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Image
                source={require(verifiedBadge)}
                style={styles.verifiedIcon}
              />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          <Text style={styles.aboutText}>{bio || 'No bio provided yet.'}</Text>
          {createdAt && (
            <Text style={styles.memberSince}>Member since: {createdAt}</Text>
          )}
          {isOwnProfile && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Share Profile</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.tabContainer}>
            {['Listings', 'Reviews', 'Badges'].map((tab) => (
              <Pressable key={tab} onPress={() => setActiveTab(tab as any)} style={styles.tab}>
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.activeUnderline} />}
              </Pressable>
            ))}
          </View>

          {activeTab === 'Badges' && (
            <View style={styles.badgeList}>
              {updatedBadgeList
                .slice(0, 10)
                .map((badge) => (
                  <TouchableOpacity
                    key={badge.id}
                    style={styles.badgeSingleItem}
                    onPress={() => Alert.alert(badge.title, badge.description)}
                  >
                    <Image
                      source={badge.isCompleted ? badge.iconCompleted : badge.iconIncomplete}
                      style={styles.badgeIcon}
                    />
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}




          {activeTab === 'Listings' && (
            listings.length > 0 ? (
              listings.map((item) => (
                <SpaceCard
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('SpaceDetail', { spaceId: item.id })}
                />
              ))
            ) : (
              <Text style={styles.message}>No listings found.</Text>
            )
          )}

{activeTab === 'Reviews' && (
  <View style={styles.reviewList}>
    {loadingReviews ? (
      <ActivityIndicator size="small" color="#000" style={{ marginTop: 20 }} />
    ) : reviews.length > 0 ? (
      reviews.map((review) => (
        <View key={review.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            {/* Left side: reviewer name + date */}
            <Text style={styles.reviewerName}>
              {review.reviewerName || 'User'}{' '}
              <Text style={styles.saysText}>says</Text>
            </Text>
            {/* Right side: stars */}
            <StarRating rating={review.rating} />
          </View>

          {/* Review description */}
          <Text style={styles.reviewText}>
            {review.description || 'No comment provided.'}
          </Text>

          {/* Optional: formatted date */}
          {review.createdAt && (
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt.seconds * 1000).toLocaleDateString()}
            </Text>
          )}
        </View>
      ))
    ) : (
      <Text style={styles.message}>No reviews yet.</Text>
    )}
  </View>
)}





        </View>
      </View>
    </ScrollView>
  );
}





const styles = StyleSheet.create({




  container: {
    flex: 1,
    backgroundColor: '#FFFCF1', // soft wheat background
  },

  headerSection: {
    height: 100,
    backgroundColor: '#F3AF1D', // mustard yellow
    justifyContent: 'center',
    position: 'relative',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    position: 'absolute',
    width: '100%',
    top: 30,
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F6B5B', // emerald green
  },
  statLabel: {
    fontSize: 12,
    color: '#444',
  },

  profileContainer: {
    alignItems: 'center',
    marginTop: -60,
    paddingHorizontal: 20,
  },

  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FFFCF1',
    backgroundColor: '#ccc',
  },

  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F6B5B', // emerald headline
    marginTop: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    marginVertical: 15,
    gap: 10,
    width: '100%',
    paddingHorizontal: 10,
  },

  button: {
    backgroundColor: '#0F6B5B', // emerald green primary button
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#FFFCF1',
    fontWeight: '600',
    fontSize: 14,
  },

  aboutText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    width: '100%',
    marginBottom: 12,
  },

  tab: {
    alignItems: 'center',
    paddingBottom: 8,
  },

  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },

  activeTabText: {
    color: '#0F6B5B',
    fontWeight: '600',
  },

  activeUnderline: {
    height: 2,
    backgroundColor: '#0F6B5B',
    width: 24,
    marginTop: 4,
    borderRadius: 1,
  },

  tabContent: {
    alignItems: 'center',
    padding: 20,
  },

  badgeList: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  badgeSingleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  badgeIcon: {
    width: 160,
    height: 160,
    marginRight: 16,
    resizeMode: 'contain',
  },

  badgeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#629447', // earthy green
  },

  postBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#fff',
    width: '100%',
  },

  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F6B5B',
  },

  postDesc: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },

  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  postDate: {
    fontSize: 12,
    color: '#888',
  },

  priceText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#F3AF1D',
  },

  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },

  scrollView: {
    flex: 1,
    backgroundColor: '#FFFCF1', // wheat background covers scroll too
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  saysText: {
    fontWeight: '400',
    color: '#666',
  },
  
  scrollContent: {
    paddingBottom: 0,
    minHeight: screenHeight,

  },
  memberSince: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5F1', // light green background
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  
  verifiedIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F6B5B', // emerald green text
  },
  reviewList: {
    marginTop: 16,
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
  },
  reviewerName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewRating: {
    color: '#FFD700',
    marginBottom: 4,
  },
  reviewText: {
    color: '#333',
  },
  
  
});
