

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect, TabRouter } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, or, and } from 'firebase/firestore';
import ReservationCard from './ReservationCard';  
import { doc, getDoc } from 'firebase/firestore';
import { Dimensions } from 'react-native';
import SpaceCard from 'src/components/SpaceCard';
import { COLORS } from '../Styles/theme';
const { width, height } = Dimensions.get('window');



type RootStackParamList = {
  MySpacesScreen: undefined;
  CreateSpaceScreen: undefined;
  EditSpaceScreen: { spaceId: string };
  RequestDetailScreen: { reservationId: string };
};



type MySpacesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MySpacesScreen'
>;

export default function MySpacesScreen() {
  const navigation = useNavigation<any>();  
  const [selectedTab, setSelectedTab] = useState<'My Spaces' | 'Bookings'>('Bookings');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userReservations, setUserReservations] = useState<any[]>([]);
  const [bookingFilter, setBookingFilter] = useState<'Requests' | 'Ongoing' | 'Previous'>('Requests');

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsLoggedIn(true);
      setUserId(user.uid);
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      setUserPosts([]);
      setUserReservations([]); // ✅ THIS is missing
      setSelectedTab('Bookings'); // optional but nice
      setBookingFilter('Requests'); // optional reset
    }
  });

  return unsubscribe;
}, []);





  const fetchUserPosts = async () => {
    if (!userId) return;

    try {
      const q = query(collection(db, 'spaces'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  async function fetchUser(userId: string) {
    const docRef = doc(db, 'users', userId);
    const userSnap = await getDoc(docRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        name: `${data.firstName} ${data.lastName}`,
        photoUrl: data.profileImage,
        // include other fields if you want
      };
    }
    return {
      name: 'Unknown User',
      photoUrl: 'https://placekitten.com/80/80',
    };
  }

  async function fetchSpace(spaceId: string) {
    const docRef = doc(db, 'spaces', spaceId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      title: data.title,
      mainImage: data.mainImage || null,
    };
  }



const fetchUserReservations = async () => {
  if (!userId) return;

  try {
    const requesterQuery = query(
      collection(db, 'reservations'),
      where('requesterId', '==', userId)
    );
    const ownerQuery = query(
      collection(db, 'reservations'),
      where('ownerId', '==', userId)
    );

    const [requesterSnapshot, ownerSnapshot] = await Promise.all([
      getDocs(requesterQuery),
      getDocs(ownerQuery),
    ]);

    const requesterReservations = await Promise.all(
      requesterSnapshot.docs.map(async (doc) => {
        const resData = doc.data();
        const owner = await fetchUser(resData.ownerId);
        const requester = await fetchUser(resData.requesterId);
        const space = await fetchSpace(resData.spaceId);

        return {
          id: doc.id,
          ...resData,
          owner,
          requester,
          space,
        };
      })
    );
    

    const ownerReservations = await Promise.all(
      ownerSnapshot.docs.map(async (doc) => {
        const resData = doc.data();
        const owner = await fetchUser(resData.ownerId);
        const requester = await fetchUser(resData.requesterId);
        const space = await fetchSpace(resData.spaceId); // <--- ADD THIS
        console.log("Fetched space for reservation:", space);

        return {
          id: doc.id,
          ...resData,
          owner,
          requester,
          space, // <--- ADD THIS

        };
      })
    );

    const combined = [...requesterReservations, ...ownerReservations];
    const uniqueReservations = combined.filter((res, index, self) =>
      index === self.findIndex((r) => r.id === res.id)
    );

    console.log("Fetched reservations with user info:", uniqueReservations);
    setUserReservations(uniqueReservations);
  } catch (error) {
    console.error('Error fetching user reservations:', error);
  }
};


useEffect(() => {
  fetchUserPosts();
  fetchUserReservations();
}, [userId]);

useFocusEffect(
  useCallback(() => {
    fetchUserPosts();
    fetchUserReservations();
  }, [userId])
);



const bookingFilterTextMap: Record<string, string> = {
  Requests: 'requested',
  Ongoing: 'ongoing',
  Previous: 'previous',
};

const renderContent = () => {
  const awaitingPosts = userPosts.filter(post => {
    const contracts = post.contracts as { [key: string]: any } | undefined;
    return !contracts || Object.keys(contracts).length === 0;
  });

  switch (selectedTab) {
    case 'My Spaces':
      return awaitingPosts.length > 0 ? (
        awaitingPosts.map((post) => (
          <SpaceCard
            key={post.id}
            item={post}
            showPublicPrivateBadge={true}
            showEditButton={true}
            onEditPress={() => {
              if (post.activeReservationId) {
                Alert.alert(
                  'Space Currently Rented',
                  'Spaces are not editable while being rented.'
                );
                return;
              }
              navigation.navigate('EditSpaceScreen', { spaceId: post.id });
            }}
            onPress={() => {
              navigation.navigate('Spaces', {
                screen: 'SpaceDetail',
                params: { spaceId: post.id, from: 'MySpaces' },
              });
            }}
          />
        ))
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.message}>Spaces you create will show up here</Text>
          <Image
            source={require('../../../assets/mySpaces/mascotPointDown.png')}
            style={styles.awaitingImage}
          />
        </View>
      );

    case 'Bookings':
      let filteredReservations = [];

      switch (bookingFilter) {
        case 'Requests':
          filteredReservations = userReservations.filter(
            r => r.status === 'requested' || r.status === 'awaiting_acceptance'
          );
          break;
        case 'Ongoing':
          filteredReservations = userReservations.filter(
            r => r.status === 'accepted' || r.status === 'confirmed'
          );
          break;
        case 'Previous':
          filteredReservations = userReservations.filter(
            r => r.status === 'completed' || r.status === 'rejected' || r.status === 'cancelled_by_renter'|| r.status === 'cancelled_by_host'
          );
          break;
      }

      return filteredReservations.length > 0 ? (
        filteredReservations.map((reservation) => {
          const isOwner = reservation.ownerId === userId;
          return (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              isOwner={isOwner}
              onPress={() =>
                navigation.navigate('RequestDetailScreen', { reservationId: reservation.id })
              }
            />
          );
        })
      ) : (
<View style={styles.placeholderImage}>
  <Text style={styles.message}>
    No {bookingFilterTextMap[bookingFilter] || bookingFilter} spaces found
  </Text>          
  <Image
    source={
      bookingFilter === 'Previous'
        ? require('../../../assets/mySpaces/previous.png')
        : require('../../../assets/mySpaces/requests.png')
    }
    style={styles.awaitingImage}
  />
</View>
      );

    default:
      return null;
  }
};





  return (

    <View style={styles.container}>
      
      <View style={styles.tabContainer}>
        
      {['My Spaces', 'Bookings'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            selectedTab === tab && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab(tab as typeof selectedTab)}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}

      
      </View>


      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

 
      {selectedTab === 'My Spaces' && (
  <View style={{ padding: 12 }}>
    <TouchableOpacity
      style={[
        styles.createButton,                   // normal active style
        !isLoggedIn && styles.createButton,  // apply disabled style if not logged in
      ]}
      onPress={() => {
        if (isLoggedIn) {
          navigation.navigate('CreateSpaceScreen');
        } else {
          alert('Please log in to create a post.');
        }
      }}
      disabled={!isLoggedIn} // disables press
    >
      <Text
        style={[
          styles.createButtonText,
          !isLoggedIn && styles.inactiveButtonText, // disabled text style
        ]}
      >
        Create Post
      </Text>
    </TouchableOpacity>
  </View>
)}

{selectedTab === 'Bookings' && (
  <View style={{ flexDirection: 'row', padding: 8 }}>
    {['Requests', 'Ongoing', 'Previous'].map(filter => {
      const isActive = bookingFilter === filter;

      return (
        <TouchableOpacity
          key={filter}
          style={[
            styles.tabButton, 
            isActive ? styles.createButton : styles.inactiveButton, // active vs inactive background
          ]}
          onPress={() => setBookingFilter(filter as typeof bookingFilter)}
        >
          <Text
            style={[
              isActive ? styles.createButtonText : styles.inactiveButtonText, // active vs inactive text
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
)}




    </View>
  );


  
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lighterGrey,

  },

  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 8,
    // backgroundColor: COLORS.darkerGrey
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.white, // Light neutral for inactive tabs
    borderBottomWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
    marginHorizontal: 4,
  },

  activeTabButton: {
    backgroundColor: '#0F6B5B', // Emerald Green
    borderColor: '#0F6B5B',
  },

  tabText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333',
  },

  activeTabText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 0
  },

  postBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#0F6B5B',
  },

  postDesc: {
    marginVertical: 8,
    fontSize: 14,
    color: '#1F1F1F',
    fontFamily: 'Poppins-Regular',
  },

  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  postDate: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'Poppins-Regular',
  },

  priceText: {
    fontWeight: '600',
    color: '#F3AF1D', // Mustard yellow for price
    fontFamily: 'Poppins-Bold',
  },

  tag: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 4,
  },

  offeringTag: {
    backgroundColor: '#DFF5D1', // light green tint
  },

  requestingTag: {
    backgroundColor: '#FFE5E5', // light red tint
  },

  requestedTag: {
    backgroundColor: '#F3AF1D', // Mustard yellow
  },

  acceptedTag: {
    backgroundColor: '#629447', // Earthy green
  },

  confirmedTag: {
    backgroundColor: '#32CD32', // Lime green (success)
  },

  tagText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
    color: '#1F1F1F',
  },

  message: {
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 20,
    fontSize: 20,
    color: '#999999',
    fontFamily: 'Poppins-Regular',
  },

  createButton: {
    backgroundColor: '#FFFFFF',      // white background
    borderWidth: 2,
    borderColor: '#0F6B5B',         // same green as your original button
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  createButtonText: {
    color: '#0F6B5B',                // text matches border
    fontWeight: '800',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  inactiveButton: {
    backgroundColor: '#F0F0F0', // light gray for inactive
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,                   // optional: makes tabs equal width
    marginHorizontal: 4,       // optional spacing between tabs
  },
  
  inactiveButtonText: {
    color: '#555555',           // darker gray text
    fontWeight: '500',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    textAlign: 'center',
  },

  awaitingImage: {
    width: width ,
    height: height * .45,
    opacity: 0.9,
    resizeMode: 'contain', // optional depending on your layout
    margin: 0,
  },

  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'absolute',   // ✅ replace 'fixed' with 'absolute'
    top: 0,
    left: 0,
    right: 0,
  }
  
});

