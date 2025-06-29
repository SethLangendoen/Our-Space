// import { useRoute, RouteProp } from '@react-navigation/native';
// import React, { useEffect } from 'react';
// import { View, Text } from 'react-native';

// type UserProfileParams = {
//   UserProfileScreen: {
//     userId: string;
//   };
// };

// export default function UserProfileScreen() {
//   const route = useRoute<RouteProp<UserProfileParams, 'UserProfileScreen'>>();
//   const { userId } = route.params;

//   useEffect(() => {
//     // fetch user info using userId
//   }, [userId]);

//   return (
//     <View>
//       <Text>Public Profile for: {userId}</Text>
//     </View>
//   );
// }


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

type UserProfileParams = {
  UserProfileScreen: {
    userId: string;
  };
};

type RouteProps = RouteProp<UserProfileParams, 'UserProfileScreen'>;

export default function UserProfileScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { userId } = route.params;

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [badgeList, setBadgeList] = useState([
		{
		  id: '5StarStreak',
		  title: '5 Star Streak',
		  description: 'Maintain 5-star reviews for 5 consecutive stays.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/5StarStreak.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/5StarStreak.png'),
		},
		{
		  id: '10XHost',
		  title: '10X Host',
		  description: 'Host 10 unique guests on your listings.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/10XHost.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/10XHost.png'),
		},
		{
		  id: '100DayMVP',
		  title: '100 Day MVP',
		  description: 'Be active on the platform for 100 days.',
		  isCompleted: true,
		  iconCompleted: require('../../assets/badges/complete/100DayMVP.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/100DayMVP.png'),
		},
		{
		  id: 'firstHost',
		  title: 'First Host',
		  description: 'Successfully host your first guest.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/firstHost.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/firstHost.png'),
		},
		{
		  id: 'firstStash',
		  title: 'First Stash',
		  description: 'Complete your first stash listing.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/firstStash.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/firstStash.png'),
		},
		{
		  id: 'fullHouse',
		  title: 'Full House',
		  description: 'Have 100% occupancy for a full week.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/fullHouse.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/fullHouse.png'),
		},
		{
		  id: 'respectedRoyalty',
		  title: 'Respected Royalty',
		  description: 'Earn the respect of fellow hosts and guests.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/respectedRoyalty.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/respectedRoyalty.png'),
		},
		{
		  id: 'socialStar',
		  title: 'Social Star',
		  description: 'Engage actively on social platforms.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/socialStar.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/socialStar.png'),
		},
		{
		  id: 'speedyReplier',
		  title: 'Speedy Replier',
		  description: 'Respond to guest inquiries in under an hour.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/speedyReplier.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/speedyReplier.png'),
		},
		{
		  id: 'verifiedHero',
		  title: 'Verified Hero',
		  description: 'Verify your identity and payment method.',
		  isCompleted: false,
		  iconCompleted: require('../../assets/badges/complete/verifiedHero.png'),
		  iconIncomplete: require('../../assets/badges/incomplete/verifiedHero.png'),
		},
	  ])

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
          setName(fullName || 'No Name');
          setBio(data.bio || '');
          setProfileImage(data.profileImage || null);
        } else {
          setName('User not found');
          setBio('');
          setProfileImage(null);
        }

        // Fetch user listings (optional)
        const listingsQuery = query(collection(db, 'spaces'), where('userId', '==', userId));
        const listingsSnap = await getDocs(listingsQuery);
        const userListings = listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setListings(userListings);

        // Optionally filter badges based on user's achievements from DB here
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../../assets/blankProfile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.bio}>{bio || 'No bio provided yet.'}</Text>

        {/* Listings tab can be added here if you want */}
        <View style={styles.listingsContainer}>
          <Text style={styles.sectionTitle}>Listings</Text>
          {listings.length > 0 ? (
            listings.map(listing => (
              <View key={listing.id} style={styles.listingBox}>
                <Text style={styles.listingTitle}>{listing.title}</Text>
                <Text numberOfLines={2} style={styles.listingDesc}>{listing.description}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noListings}>No listings available.</Text>
          )}
        </View>

        {/* Badges (show all or filtered) */}
        <View style={styles.badgeList}>
          {badgeList.map(badge => (
            <TouchableOpacity
              key={badge.id}
              style={styles.badgeItem}
              onPress={() => Alert.alert(badge.title, badge.description)}
            >
              <Image source={badge.iconIncomplete} style={styles.badgeIcon} />
              <Text style={styles.badgeTitle}>{badge.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}





// const styles = StyleSheet.create({
// 	container: {
// 	  flex: 1,
// 	  backgroundColor: '#fff',
// 	},
// 	headerSection: {
// 	  height: 100,
// 	  backgroundColor: '#E3A72F',
// 	  justifyContent: 'center',
// 	  position: 'relative',
// 	},
	
// 	statsRow: {
// 	  flexDirection: 'row',
// 	  justifyContent: 'space-between',
// 	  paddingHorizontal: 40,
// 	  position: 'absolute',
// 	  width: '100%',
// 	  top: 30, // adjust as needed to vertically center with profile image
// 	},
	
// 	statBox: {
// 	  alignItems: 'center',
// 	},
// 	statNumber: {
// 	  fontSize: 16,
// 	  fontWeight: 'bold',
// 	},
// 	statLabel: {
// 	  fontSize: 12,
// 	  color: '#444',
// 	},
	
// 	profileContainer: {
// 	  alignItems: 'center',
// 	  marginTop: -60,
// 	  paddingHorizontal: 20,
// 	},
	
// 	profileImage: {
// 	  width: 130,
// 	  height: 130,
// 	  borderRadius: 65,
// 	  borderWidth: 4,
// 	  borderColor: '#fff',
// 	  backgroundColor: '#ccc',
// 	},
	
  
// 	name: {
// 	  fontSize: 20,
// 	  fontWeight: '600',
// 	  marginTop: 12,
// 	},
  
// 	buttonRow: {
// 	  flexDirection: 'row',
// 	  marginVertical: 15,
// 	  gap: 10,
// 	  width: '100%',          // make sure container is full width
// 	  paddingHorizontal: 10,  // optional, to align with profile container padding
// 	},
	
// 	button: {
// 	  backgroundColor: '#000',
// 	  paddingVertical: 6,
// 	  borderRadius: 6,
// 	  flex: 1,                // take equal space
// 	  alignItems: 'center',
// 	  justifyContent: 'center',
// 	},
// 	buttonText: {
// 	  color: '#fff',
// 	  fontWeight: '500',
// 	},
// 	aboutText: {
// 	  fontSize: 14,
// 	  color: '#444',
// 	  textAlign: 'center',
// 	  marginTop: 8,
// 	  marginBottom: 16,
// 	},
// 	tabContainer: {
// 	  flexDirection: 'row',
// 	  justifyContent: 'space-around',
// 	  borderBottomWidth: 1,
// 	  borderBottomColor: '#ccc',
// 	  width: '100%',
// 	  marginBottom: 12,
// 	},
// 	tab: {
// 	  alignItems: 'center',
// 	  paddingBottom: 8,
// 	},
// 	tabText: {
// 	  fontSize: 14,
// 	  color: '#888',
// 	},
// 	activeTabText: {
// 	  color: '#000',
// 	  fontWeight: '600',
// 	},
// 	activeUnderline: {
// 	  height: 2,
// 	  backgroundColor: '#000',
// 	  width: 24,
// 	  marginTop: 4,
// 	  borderRadius: 1,
// 	},
// 	tabContent: {
// 	  alignItems: 'center',
// 	  padding: 20,
// 	},
  
// 	badgeList: {
// 	  paddingTop: 20,
// 	  paddingHorizontal: 20,
// 	},
	
// 	badgeSingleItem: {
// 	  flexDirection: 'row',
// 	  alignItems: 'center',
// 	  paddingVertical: 12,
// 	  borderBottomWidth: 1,
// 	  borderBottomColor: '#eee',
// 	},
	
// 	badgeIcon: {
// 	  width: 160,
// 	  height: 160,
// 	  marginRight: 16,
// 	  resizeMode: 'contain',
// 	},
	
// 	badgeTitle: {
// 	  fontSize: 16,
// 	  fontWeight: '500',
// 	},
	
  
  
// 	postBox: {
// 	  borderWidth: 1,
// 	  borderColor: '#ccc',
// 	  borderRadius: 10,
// 	  padding: 15,
// 	  marginVertical: 10,
// 	  backgroundColor: '#f9f9f9',
// 	  width: '100%',
// 	},
	
// 	postHeader: {
// 	  flexDirection: 'row',
// 	  justifyContent: 'space-between',
// 	  alignItems: 'center',
// 	  marginBottom: 6,
// 	},
	
// 	postTitle: {
// 	  fontSize: 16,
// 	  fontWeight: 'bold',
// 	},
	
// 	tag: {
// 	  paddingVertical: 4,
// 	  paddingHorizontal: 8,
// 	  borderRadius: 12,
// 	},
	
// 	offeringTag: {
// 	  backgroundColor: '#28a745', // green
// 	},
	
// 	requestingTag: {
// 	  backgroundColor: '#dc3545', // red
// 	},
	
// 	tagText: {
// 	  color: 'white',
// 	  fontWeight: '600',
// 	  fontSize: 12,
// 	},
	
// 	postDesc: {
// 	  fontSize: 14,
// 	  color: '#444',
// 	  marginBottom: 5,
// 	},
	
// 	postFooter: {
// 	  flexDirection: 'row',
// 	  justifyContent: 'space-between',
// 	  alignItems: 'center',
// 	  marginTop: 10,
// 	},
	
// 	postDate: {
// 	  fontSize: 12,
// 	  color: '#888',
// 	},
	
// 	priceText: {
// 	  fontWeight: 'bold',
// 	  fontSize: 16,
// 	  color: '#007bff', // blue
// 	},
	
// 	message: {
// 	  fontSize: 16,
// 	  color: '#666',
// 	  textAlign: 'center',
// 	  marginTop: 20,
// 	},
// 	scrollContent: {
// 	  paddingBottom: 0, // so content doesn't get cut off
// 	},
	
  
	
	
	
	
//   });
  


const styles = StyleSheet.create({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	scrollContent: { paddingBottom: 40 },
	container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
	profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 12, backgroundColor: '#ccc' },
	name: { fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
	bio: { fontSize: 16, color: '#444', marginBottom: 20, textAlign: 'center' },
  
	listingsContainer: { width: '100%', marginBottom: 20 },
	sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
	listingBox: {
	  padding: 12,
	  borderWidth: 1,
	  borderColor: '#ddd',
	  borderRadius: 8,
	  marginBottom: 10,
	},
	listingTitle: { fontSize: 16, fontWeight: '700' },
	listingDesc: { fontSize: 14, color: '#555' },
	noListings: { fontStyle: 'italic', textAlign: 'center', color: '#999' },
  
	badgeList: {
	  flexDirection: 'row',
	  flexWrap: 'wrap',
	  justifyContent: 'center',
	},
	badgeItem: {
	  alignItems: 'center',
	  margin: 10,
	},
	badgeIcon: {
	  width: 60,
	  height: 60,
	},
	badgeTitle: {
	  marginTop: 6,
	  fontSize: 12,
	  fontWeight: '600',
	  textAlign: 'center',
	},
  });