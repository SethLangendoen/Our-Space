


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Dimensions,
//   Pressable,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { auth, db } from '../../firebase/config';
// import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
// import { useIsFocused } from '@react-navigation/native'; // 👈 Add this
// import SpaceCard from '../../components/SpaceCard'; // ⬅️ Add at top if not already

// import { Ionicons } from '@expo/vector-icons'; // 👈 or any other icon library
// import { useLayoutEffect } from 'react';

// const { width } = Dimensions.get('window');

// type ProfileStackParamList = {
//   ProfileMain: undefined;
//   EditProfile: undefined;
//   SpaceDetail: { spaceId: string };  // <-- add this line

// };

// type ProfileScreenNavigationProp = NativeStackNavigationProp<
//   ProfileStackParamList,
//   'ProfileMain'
// >;




// export default function ProfileScreen() {
//   const [activeTab, setActiveTab] = useState<'Listings' | 'Reviews' | 'Badges'>('Listings');
//   const navigation = useNavigation<ProfileScreenNavigationProp>();

//   const badgeList = [
//     {
//       id: '5StarStreak',
//       title: '5 Star Streak',
//       description: 'Maintain 5-star reviews for 5 consecutive stays.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/5StarStreak.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/5StarStreak.png'),
//     },
//     {
//       id: '10XHost',
//       title: '10X Host',
//       description: 'Host 10 unique guests on your listings.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/10XHost.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/10XHost.png'),
//     },
//     {
//       id: '100DayMVP',
//       title: '100 Day MVP',
//       description: 'Be active on the platform for 100 days.',
//       isCompleted: true,
//       iconCompleted: require('../../../assets/badges/complete/100DayMVP.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/100DayMVP.png'),
//     },
//     {
//       id: 'firstHost',
//       title: 'First Host',
//       description: 'Successfully host your first guest.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/firstHost.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/firstHost.png'),
//     },
//     {
//       id: 'firstStash',
//       title: 'First Stash',
//       description: 'Complete your first stash listing.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/firstStash.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/firstStash.png'),
//     },
//     {
//       id: 'fullHouse',
//       title: 'Full House',
//       description: 'Have 100% occupancy for a full week.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/fullHouse.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/fullHouse.png'),
//     },
//     {
//       id: 'respectedRoyalty',
//       title: 'Respected Royalty',
//       description: 'Earn the respect of fellow hosts and guests.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/respectedRoyalty.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/respectedRoyalty.png'),
//     },
//     {
//       id: 'socialStar',
//       title: 'Social Star',
//       description: 'Engage actively on social platforms.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/socialStar.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/socialStar.png'),
//     },
//     {
//       id: 'speedyReplier',
//       title: 'Speedy Replier',
//       description: 'Respond to guest inquiries in under an hour.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/speedyReplier.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/speedyReplier.png'),
//     },
//     {
//       id: 'verifiedHero',
//       title: 'Verified Hero',
//       description: 'Verify your identity and payment method.',
//       isCompleted: false,
//       iconCompleted: require('../../../assets/badges/complete/verifiedHero.png'),
//       iconIncomplete: require('../../../assets/badges/incomplete/verifiedHero.png'),
//     },
//   ];
  
  
//   const [name, setName] = useState<string>('');
//   const [bio, setBio] = useState<string>('');
//   const [loading, setLoading] = useState(true);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const isFocused = useIsFocused(); 
//   const [listings, setListings] = useState<any[]>([]);

//   const fetchUserListings = async () => {
//     const user = auth.currentUser;
//     if (!user) return;
  
//     try {
//       const q = query(collection(db, 'spaces'), where('userId', '==', user.uid));
//       const querySnapshot = await getDocs(q);
//       const posts = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setListings(posts);
//     } catch (error) {
//       console.error('Error fetching user listings:', error);
//     }
//   };

//   useEffect(() => {
//     if (isFocused) {
//       fetchUserData();
//       fetchUserListings();
//     }
//   }, [isFocused]);
  
  
//   const fetchUserData = async () => {
//     const user = auth.currentUser;
//     if (!user) return;
  
//     setLoading(true);
  
//     try {
//       const userRef = doc(db, 'users', user.uid);
//       const userSnap = await getDoc(userRef);
  
//       if (userSnap.exists()) {
//         const data = userSnap.data();
//         const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
//         setName(fullName || 'No Name');
//         setBio(data.bio || '');
//         setProfileImage(data.profileImage || null);  // <-- load profile image URL here
//       } else {
//         setName(user.email || '');
//         setBio('');
//         setProfileImage(null);
//       }
//     } catch (error) {
//       console.error('Error fetching profile:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  




//   // Initial fetch on first mount
//   useEffect(() => {
//     fetchUserData();
//   }, []);

//   // Refetch on focus (e.g. after editing profile)
//   useEffect(() => {
//     if (isFocused) {
//       fetchUserData();
//     }
//   }, [isFocused]);

//   if (loading) {
//     return (
//       <View style={styles.tabContent}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }


//   return (
//     <ScrollView contentContainerStyle={styles.scrollContent}>

//     <View style={styles.container}>

//       {/* <View style={styles.headerBackground} /> */}

//       <View style={styles.headerSection}>
//         <View style={styles.statsRow}>
//           <View style={styles.statBox}>
//             <Text style={styles.statNumber}>10</Text>
//             <Text style={styles.statLabel}>Space Badges</Text>
//           </View>
//           <View style={styles.statBox}>
//             <Text style={styles.statNumber}>3</Text>
//             <Text style={styles.statLabel}>Reviews</Text>
//           </View>
//         </View>
//       </View>



//       <View style={styles.profileContainer}>
//       <Image
//           source={profileImage ? { uri: profileImage } : require('../../../assets/blankProfile.png')}
//           style={styles.profileImage}
//         />

//         <Text style={styles.name}>{name}</Text>

//         <Text style={styles.aboutText}>
//           {bio || 'No bio provided yet.'}
//         </Text>


//         <View style={styles.buttonRow}>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => navigation.navigate('EditProfile')}
//           >
//             <Text style={styles.buttonText}>Edit Profile</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.button}>
//             <Text style={styles.buttonText}>Share Profile</Text>
//           </TouchableOpacity>
//         </View>



//         <View style={styles.tabContainer}>
//           {['Listings', 'Reviews', 'Badges'].map((tab) => (
//             <Pressable key={tab} onPress={() => setActiveTab(tab as any)} style={styles.tab}>
//               <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
//                 {tab}
//               </Text>
//               {activeTab === tab && <View style={styles.activeUnderline} />}
//             </Pressable>
//           ))}
//         </View>

//         {activeTab === 'Badges' && (
//   <View style={styles.badgeList}>
//     {badgeList
//       .filter((badge) => !badge.isCompleted)
//       .slice(0, 10) // show up to 10 incomplete badges
//       .map((badge) => (
//         <TouchableOpacity
//           key={badge.id}
//           style={styles.badgeSingleItem}
//           onPress={() => Alert.alert(badge.title, badge.description)}
//         >
//           <Image
//             source={badge.iconIncomplete}
//             style={styles.badgeIcon}
//           />
//           <Text style={styles.badgeTitle}>{badge.title}</Text>
//         </TouchableOpacity>
//       ))}
//   </View>
// )}





// {activeTab === 'Listings' && (
//   listings.length > 0 ? (
//     listings.map((item) => (
//       <SpaceCard
//         key={item.id}
//         item={item}
//         onPress={() => navigation.navigate('SpaceDetail', { spaceId: item.id })}
//       />
//     ))
//   ) : (
//     <Text style={styles.message}>No listings found.</Text>
//   )
// )}


//       </View>
//     </View>
//     </ScrollView>

//   );
// }




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

const { width } = Dimensions.get('window');

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

  const viewingUserId = route.params?.userId ?? auth.currentUser?.uid;
  const isOwnProfile = viewingUserId === auth.currentUser?.uid;

  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);


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
      if (userSnap.exists()) {
        const data = userSnap.data();
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        setName(fullName || 'No Name');
        setBio(data.bio || '');
        setProfileImage(data.profileImage || null);
      } else {
        setName('Unknown User');
        setBio('');
        setProfileImage(null);
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
    }
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
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

          <Text style={styles.aboutText}>{bio || 'No bio provided yet.'}</Text>

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
              {badgeList
                .filter((badge) => !badge.isCompleted)
                .slice(0, 10)
                .map((badge) => (
                  <TouchableOpacity
                    key={badge.id}
                    style={styles.badgeSingleItem}
                    onPress={() => Alert.alert(badge.title, badge.description)}
                  >
                    <Image source={badge.iconIncomplete} style={styles.badgeIcon} />
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
        </View>
      </View>
    </ScrollView>
  );
}








const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    height: 100,
    backgroundColor: '#E3A72F',
    justifyContent: 'center',
    position: 'relative',
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    position: 'absolute',
    width: '100%',
    top: 30, // adjust as needed to vertically center with profile image
  },
  
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
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
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#ccc',
  },
  

  name: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    marginVertical: 15,
    gap: 10,
    width: '100%',          // make sure container is full width
    paddingHorizontal: 10,  // optional, to align with profile container padding
  },
  
  button: {
    backgroundColor: '#000',
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,                // take equal space
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
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
    borderBottomColor: '#ccc',
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
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  activeUnderline: {
    height: 2,
    backgroundColor: '#000',
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
    fontWeight: '500',
  },
  


  postBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007bff', // blue
  },
  
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 0, // so content doesn't get cut off
  },
  






  
  
  
  
});
