

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs, or, and } from 'firebase/firestore';
import ReservationCard from './ReservationCard';  // adjust path if needed
import { doc, getDoc } from 'firebase/firestore';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

// type RootStackParamList = {
//   MySpacesScreen: undefined;
//   CreateSpaceScreen: undefined;
//   EditSpaceScreen: { spaceId: string };
//   ContractDetailScreen: { postId: string };

// };

type RootStackParamList = {
  MySpacesScreen: undefined;
  CreateSpaceScreen: undefined;
  EditSpaceScreen: { spaceId: string };
  RequestDetailScreen: { reservationId: string };
  ConfirmedReservationScreen: { reservationId: string };
};



type MySpacesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MySpacesScreen'
>;

export default function MySpacesScreen() {
  const navigation = useNavigation<MySpacesScreenNavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'Awaiting' | 'Requested' | 'Confirmed'>('Requested');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userReservations, setUserReservations] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
        setUserPosts([]);
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



const renderContent = () => {

	const awaitingPosts = userPosts.filter(post => {
		const contracts = post.contracts as { [key: string]: any } | undefined;
		// Awaiting means no contracts or contracts object is empty
		return !contracts || Object.keys(contracts).length === 0;
	  });
	
	  const ongoingPosts = userPosts.filter((post) => {
		const contracts = post.contracts as { [key: string]: any } | undefined;
		if (!contracts) return false;
	  
		return Object.values(contracts).some((contract) =>
		  ['requested', 'accepted', 'confirmed'].includes(contract.state)
		);
	  });
	  
  
	switch (selectedTab) {


      case 'Awaiting':
        return awaitingPosts.length > 0 ? (
          awaitingPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              onPress={() =>
                navigation.navigate('EditSpaceScreen', { spaceId: post.id })
              }
              style={styles.postBox}
            >
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>{post.title}</Text>
                {post.postType && (
                  <View
                    style={[
                      styles.tag,
                      post.postType === 'Offering'
                        ? styles.offeringTag
                        : styles.requestingTag,
                    ]}
                  >
                    <Text style={styles.tagText}>{post.postType}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.postDesc}>{post.description}</Text>
              <View style={styles.postFooter}>
                <Text style={styles.postDate}>
                  {post.availability?.startDate} → {post.availability?.endDate}
                </Text>
                {post.price && (
                  <Text style={styles.priceText}>${post.price}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
			<View style={styles.placeholderImage}>
			<Text style={styles.message}>Spaces you create will show up here</Text>
			<Image
				source={require('../../../assets/mySpaces/awaitingPosts.png')}
				style={styles.awaitingImage}
				resizeMode="contain"
			/>
			</View>

        );


        case 'Requested':
          const requested = userReservations.filter(r => r.status === 'requested');
          console.log(requested.length);
          return requested.length > 0 ? (
            requested.map((reservation) => {
              const isOwner = reservation.ownerId === userId;
              return (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  isOwner={isOwner}
                  onPress={() => navigation.navigate('RequestDetailScreen', { reservationId: reservation.id })}
                />
              );
            })
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.message}>Space requests will show up here</Text>
              <Image
                source={require('../../../assets/mySpaces/requests.png')}
                style={styles.awaitingImage}
                resizeMode="contain"
              />
            </View>
          );
        
        
        case 'Confirmed':
          const confirmed = userReservations.filter(r => r.status === 'confirmed');
          return confirmed.length > 0 ? (
            confirmed.map((reservation) => (
              <TouchableOpacity
                key={reservation.id}
                onPress={() => navigation.navigate('ConfirmedReservationScreen', { reservationId: reservation.id })}
                style={styles.postBox}
              >
                <Text style={styles.postTitle}>{reservation.spaceTitle}</Text>
                <Text style={styles.postDesc}>{reservation.description}</Text>
                <Text style={styles.postDate}>
                  {reservation.startDate?.toDate().toDateString()} → {reservation.endDate?.toDate().toDateString()}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.message}>No confirmed reservations yet</Text>
              <Image
                source={require('../../../assets/mySpaces/ongoingContract.png')}
                style={styles.awaitingImage}
                resizeMode="contain"
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

      {['Awaiting', 'Requested', 'Confirmed'].map((tab) => (
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

      <View style={styles.content}>{renderContent()}</View>

 
      {selectedTab === 'Awaiting' && (
    <TouchableOpacity
      style={[
        styles.createButton,
        !isLoggedIn && { backgroundColor: '#aaa' },
      ]}
      onPress={() => {
        if (isLoggedIn) {
          navigation.navigate('CreateSpaceScreen');
        } else {
          alert('Please log in to create a post.');
        }
      }}
      disabled={!isLoggedIn}
    >
      <Text style={styles.createButtonText}>Create Post</Text>
    </TouchableOpacity>
  )}

    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFCF1', // Wheat/Cream background
  },

  tabContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#E6E6E6', // Light neutral for inactive tabs
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
    marginTop: 100,
    marginBottom: 10,
    fontSize: 20,
    color: '#999999',
    fontFamily: 'Poppins-Regular',
  },

  createButton: {
    backgroundColor: '#0F6B5B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },

  // awaitingImage: {
  //   width: 200,
  //   height: 200,
  //   opacity: 0.9,
  // },

  awaitingImage: {
    width: width ,
    height: height * .5,
    opacity: 0.9,
    resizeMode: 'contain', // optional depending on your layout
  },

  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

