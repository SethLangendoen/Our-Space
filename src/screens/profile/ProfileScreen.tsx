import { setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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
import { COLORS, FONT_SIZES, SPACING, COMMON_STYLES } from '../Styles/theme';
import { useNavigation, useRoute, useIsFocused, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, db } from '../../firebase/config';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import SpaceCard from '../../components/SpaceCard';
import ProfileStatsBadge from './ProfileStatsBadge';
import Badges from './Badges';
import Reviews from './Reviews';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { buildUnavailableHoursBlocks } from 'react-native-calendars/src/timeline/Packer';
const star = require('assets/badges/profileIcon/star.png');
const badge = require('assets/badges/profileIcon/trophy.png');


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

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'Listings' | 'Reviews' | 'Badges'>('Listings');
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<RouteProp<ProfileStackParamList, 'ProfileMain'>>();
  const isFocused = useIsFocused();
  const [role, setRole] = useState(null);
  const viewingUserId = route.params?.userId ?? auth.currentUser?.uid;
  const isOwnProfile = viewingUserId === auth.currentUser?.uid;

  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  


  
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
        const fullName = `${data.firstName || ''} ${data.lastName ? data.lastName.charAt(0) + '.' : ''}`.trim();
        setName(fullName || 'No Name');
        setBio(data.bio || '');
        setProfileImage(data.profileImage || null);
        setRole(data.role)
  
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          setCreatedAt(date);
          const formattedDate = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
          console.log("Member since:", formattedDate);
        }

        if (data.badges) {
          const trueBadges = Object.values(data.badges).filter(Boolean).length;
          setBadgeCount(trueBadges);
        } else {
          setBadgeCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return '';
    if (role === 'host') return 'Space Host';
    if (role === 'renter') return 'Space Renter';
    return role; // fallback just in case
  };
  


  const fetchReviewCount = async () => {
    if (!viewingUserId) return;
  
    try {
      const reviewsRef = collection(db, 'users', viewingUserId, 'reviews');
      const snapshot = await getDocs(reviewsRef);
      setReviewCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching review count:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
      fetchUserListings();
      fetchVerificationStatus();
      fetchReviewCount();
    }
  }, [isFocused]);
  
  

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
  
        // ✅ Persist verifiedHero badge
        if (data.verified) {
          const userRef = doc(db, 'users', viewingUserId);
          const userSnap = await getDoc(userRef);
  
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const badges = userData.badges || {};
  
            // Only update if not already earned
            if (!badges.verifiedHero) {
              await updateDoc(userRef, {
                'badges.verifiedHero': true,
              });
            }
          }
        }
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




  return (
    <ScrollView 
    style={styles.scrollView} 
    contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.container}>


        <View style={styles.headerSection}>
          <View style={styles.statsRow}>
            {/* Badge Stat */}

            <View style={styles.statBox}>
              <View style={styles.statImageWrapper}>
                <Image
                  source={badge} // or badge
                  style={styles.statImage}
                />
                <Text style={styles.statNumberOverlay}>{badgeCount}</Text>
              </View>
              <Text style={styles.statLabel}>Badges</Text>
            </View>


            {/* Review Stat */}
            <View style={styles.statBox}>
              <View style={styles.statImageWrapper}>

              <Image
                source={star} // replace with your review image
                style={styles.statImage}
              />
              <Text style={styles.statNumberOverlay}>{reviewCount}</Text>
              </View>

              <Text style={styles.statLabel}>Reviews</Text>
            </View>

          </View>
        </View>







        <View style={styles.profileContainer}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={profileImage ? { uri: profileImage } : require('../../../assets/blankProfile.png')}
              style={styles.profileImage}
            />
          </View>


          {role && (
            <Text style={styles.role}>{getRoleLabel(role)}</Text>
          )}


          {isVerified && (
            <View style={styles.verifiedBadge}>
              <Image
                source={require(verifiedBadge)}
                style={styles.verifiedIcon}
              />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          <Text style={styles.name}>{name}</Text>

          <Text style={styles.aboutText}>{bio || 'No bio provided yet.'}</Text>
          {createdAt && (
            <Text style={styles.memberSince}>
              Member since: {createdAt ? createdAt.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Unknown'}
            </Text>
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
              <Badges
                isVerified
                createdAt={createdAt}
              />
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
              <Reviews 
              activeTab={activeTab}
              viewingUserId={viewingUserId}
              /> 
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
    backgroundColor: COLORS.lighterGrey, 
  },


  headerSection: {
    height: 100,
    backgroundColor: 'white', 
    justifyContent: 'center',
    position: 'relative',
    
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    position: 'absolute',
    width: '100%',
    top: 10,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#0F6B5B', // emerald green
  },
  statLabel: {
    fontSize: 12,
    color: 'black',
  },

  profileContainer: {
    alignItems: 'center',
    marginTop: -60,
    paddingHorizontal: 20,
  },
  profileImageWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75, // half of width/height
    borderWidth: 3,   // this will be the outer border color
    borderColor: '#13AD58', // outer border
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // this becomes the "inner border"
  },
  profileImage: {
    width: 140,  // slightly smaller than wrapper
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F6B5B', // emerald headline
    marginTop: 0,
  },
  role: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F6B5B', // emerald headline
    marginTop: -20,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    borderColor: '#13AD58',
    borderRadius: 10,
    borderWidth: 3

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
    marginLeft: 0,
    marginTop: 20,
  },
  
  verifiedIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F6B5B',
  },
  reviewList: {
    flex: 1,          
    width: '100%',    
    paddingHorizontal: 0, 
  },
  reviewRating: {
    color: '#FFD700',
    marginBottom: 4,
  },
  reviewText: {
    color: '#333',
  },

  statImageWrapper: {
    width: 60,           // match your image width
    height: 60,          // match your image height
    justifyContent: 'center', // vertical center
    alignItems: 'center',     // horizontal center
    position: 'relative',     // needed for absolute overlay
  },
  statNumberOverlay: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',       // text color on top of image
  },
  statImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },

  
});
