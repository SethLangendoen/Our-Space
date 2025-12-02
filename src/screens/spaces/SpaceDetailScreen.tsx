
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { AuthError } from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import BlockedCalendar from 'src/components/BlockedCalendar';
// import DateTimePicker from '@react-native-community/datetimepicker';

import { KeyboardAvoidingView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';





type RootStackParamList = {
  Spaces: undefined;
  Filters: undefined;
  SpaceDetail: { spaceId: string };
  UserProfile: { userId: string };

};

type Props = NativeStackScreenProps<RootStackParamList, 'SpaceDetail'>;

// export default function SpaceDetailScreen({ route }: Props) {
  export default function SpaceDetailScreen({ navigation, route }: Props) {

  const { spaceId } = route.params;
  const [space, setSpace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [booking, setBooking] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [reservationDescription, setReservationDescription] = useState('');

  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  useEffect(() => {
    console.log('selectedRange changed:', selectedRange);
  }, [selectedRange]);



 const [currentUser, setCurrentUser] = useState<string | null>(null);

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(user => {
    setCurrentUser(user?.uid ?? null);
  });
  return unsubscribe;
}, []);


useEffect(() => {
	const fetchSpaceAndUser = async () => {
	  try {
		const docRef = doc(db, 'spaces', spaceId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
		  const spaceData = docSnap.data();
      setSpace({ ...spaceData, id: docSnap.id }); // <-- add id here
  
		  // Fetch the user who posted the space
		  if (spaceData.userId) {
			const userRef = doc(db, 'users', spaceData.userId);
			const userSnap = await getDoc(userRef);
			if (userSnap.exists()) {
			  setUserData(userSnap.data());
			}
		  }
		} else {
		  console.log('No such space document!');
		}
	  } catch (error) {
		console.error('Error fetching space or user data:', error);
	  } finally {
		setLoading(false);
	  }
	};
  
	fetchSpaceAndUser();
  }, [spaceId]);




  const formatDate = (date: any) => {
    // Accepts Firestore Timestamp or JS Date or ISO string
    if (!date) return 'N/A';
    let d: Date;
    if (date instanceof Timestamp) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'string') {
      d = new Date(date);
    } else {
      return 'Invalid date';
    }
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!space) {
    return (
      <View style={styles.center}>
        <Text>Space not found.</Text>
      </View>
    );
  }

  // Handle multiple images if available, else fallback to single mainImage or none
  const images = space.images && Array.isArray(space.images)
    ? space.images
    : space.mainImage
    ? [space.mainImage]
    : [];



    const sendMessage = async () => {
      if (!auth.currentUser?.uid || !space?.userId || !message.trim()) return;
    
      setSending(true);
      const senderId = auth.currentUser.uid;
      const receiverId = space.userId;
      const chatId = [senderId, receiverId].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
    
      try {
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            users: [senderId, receiverId],
            lastMessage: message,
            updatedAt: serverTimestamp(),
          });
        } else {
          await setDoc(
            chatRef,
            {
              lastMessage: message,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
  

        await addDoc(collection(chatRef, 'messages'), {
          text: message,
          senderId,
          createdAt: serverTimestamp(),
          isReference: true,
          referenceData: {
            title: space.title,
            image: images[0] || null,
            spaceId: spaceId,
          },
        });

        await addDoc(collection(chatRef, 'messages'), {
          text: message,
          senderId,
          createdAt: serverTimestamp(),
        });
        
        
    
        setMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setSending(false);
      }
    };



    const handleReservation = async () => {
      if (!currentUser || !selectedRange.start || !selectedRange.end || !space?.id || currentUser === space.userId) return;
    
      try {
        setBooking(true);
    
        const postRef = doc(db, 'spaces', space.id);
    
        // Prevent duplicate
        const docSnap = await getDoc(postRef);
        const existingContracts = docSnap.exists() ? docSnap.data().contracts || {} : {};
    
        if (existingContracts[currentUser]) {
          Alert.alert('Already Requested', 'You have already requested a reservation for this space.');
          setBooking(false);
          return;
        }
    
        const contractData = {
          userId: currentUser,
          requestedAt: Timestamp.now(),
          startDate: Timestamp.fromDate(selectedRange.start),
          endDate: Timestamp.fromDate(selectedRange.end),
          state: 'requested',
          description: reservationDescription,
        };
    
        await setDoc(
          postRef,
          { [`contracts.${currentUser}`]: contractData },
          { merge: true }
        );
    
        // Create reservation
        const reservationRef = await addDoc(collection(db, 'reservations'), {
          spaceId: space.id,
          spaceTitle: space.title || '',
          requesterId: currentUser,
          ownerId: space.userId,
          startDate: Timestamp.fromDate(selectedRange.start),
          endDate: Timestamp.fromDate(selectedRange.end),
          description: reservationDescription,
          createdAt: serverTimestamp(),
          status: 'requested',
        });
    
        Alert.alert('Reservation Requested', 'The space owner will review your request.');
        setReservationDescription('');
        setSelectedRange({ start: null, end: null });
    
        // ---------------------------
        // Send automatic reference message
        // ---------------------------
        const senderId = currentUser;
        const receiverId = space.userId;
        const chatId = [senderId, receiverId].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
    
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            users: [senderId, receiverId],
            lastMessage: `Requested ${space.title}`,
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(chatRef, {
            lastMessage: `Requested ${space.title}`,
            updatedAt: serverTimestamp(),
          });
        }
    
        // Add the "rendered reservation request" message
        await addDoc(collection(chatRef, 'messages'), {
          senderId,
          createdAt: serverTimestamp(),
          isReference: true,
          referenceData: {
            title: space.title,
            image: space.images?.[0] || null, // optional main image
            reservationId: reservationRef.id, // links to RequestDetailScreen
          },
        });
    
        console.log('Reservation request message sent to chat.');
    
      } catch (err) {
        console.error('Reservation Error:', err);
        Alert.alert('Error', 'Could not submit reservation.');
      } finally {
        setBooking(false);
      }
    };
    





  return (


    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS uses padding, Android height
    keyboardVerticalOffset={0} // tweak this so the box clears the header
  >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Images Carousel / Stack */}
      {images.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
          {images.map((uri: string, index: number) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}




{space.location.lat && space.location.lng && (
  <View style={styles.mapContainer}>
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: space.location.lat,
        longitude: space.location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      <Marker
        coordinate={{ latitude: space.location.lat, longitude: space.location.lng }}
        title={space.title}
        description={space.address || ''}

      />
    </MapView>
    {space.postalCode && (
      <Text style={styles.postalCode}>Postal Code: {space.postalCode}</Text>
    )}
  </View>
)}




<TouchableOpacity
  style={styles.userRow}
  onPress={() => {
    if (space?.userId) {
      navigation.navigate('UserProfile', { userId: space.userId });
    }
  }}
>

<View style={styles.userRow}>
  <Image
    source={
      userData?.profileImage
        ? { uri: userData.profileImage }
        : require('../../../assets/blankProfile.png')
    }
    style={styles.userImage}
  />

  <Text style={styles.userName}>
    {userData
      ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
      : 'Unknown User'}
  </Text>

  {space.postType && (
    <View
      style={[
        styles.tag,
        space.postType === 'Offering'
          ? styles.offeringTag
          : styles.requestingTag,
        styles.inlineTag, // new style for spacing
      ]}
    >
      <Text style={styles.tagText}>{space.postType}</Text>
    </View>
  )}
</View>

</TouchableOpacity>



      <Text style={styles.title}>{space.title || 'No Title'}</Text>


      {space.description && <Text style={styles.description}>{space.description}</Text>}

      {space.price && (
        <Text style={styles.price}>${parseFloat(space.price).toFixed(2)} {space.billingFrequency} </Text>
      )}



	  <Text style={styles.label}>
		Location:{' '}
		<Text style={styles.value}>
			{space.address ? space.address.slice(-7) : 'N/A'}
		</Text>
	</Text>


      <Text style={styles.label}>
        Storage Type: <Text style={styles.value}>{space.storageType || 'N/A'}</Text>
      </Text>

      <Text style={styles.label}>
  Usage Type: <Text style={styles.value}>
    {Array.isArray(space.usageType) && space.usageType.length > 0
      ? space.usageType.join(', ')
      : 'N/A'}
  </Text>
</Text>




<Text style={styles.label}>
  Accessibility: <Text style={styles.value}>{space.accessibility || 'N/A'}</Text>
</Text>


{space.security?.length > 0 && (
  <Text style={styles.label}>
    Security: <Text style={styles.value}>{space.security.join(', ')}</Text>
  </Text>
)}

<Text style={styles.label}>
  Availability:
  <Text style={styles.value}>
    {' '}
    {space.availability?.startDate || 'N/A'} - {space.availability?.endDate || 'N/A'}
  </Text>
</Text>
{/* 
<Text style={styles.label}>
  Delivery Method:
  <Text style={styles.value}>
    {' '}
    {space.deliveryMethod?.length > 0 ? space.deliveryMethod.join(', ') : 'N/A'}
  </Text>
</Text> */}

<Text style={styles.label}>
  Dimensions:
  <Text style={styles.value}>
    {' '}
    {space.dimensions?.width || '?'}ft (W) × {space.dimensions?.length || '?'}ft (L) × {space.dimensions?.height || '?'}ft (H)
  </Text>
</Text>



{!currentUser ? (
  <View style={styles.noticeBox}>
    <Text style={styles.noticeText}>
      Log in to book space reservations or message the owner.
    </Text>
  </View>
) : currentUser === space.userId ? (
  <View style={styles.noticeBox}>
    <Text style={styles.noticeText}>You are viewing your own post.</Text>
  </View>
) : (


  <>

    {/* Reservation Section */}
    <View style={styles.bookingContainer}>
      <Text style={styles.bookingTitle}>Book Reservation</Text>

      <BlockedCalendar
        blockedTimes={space.blockedTimes || []}
        onSelectRange={(range) => setSelectedRange(range)}
        editable={false}
      />

<View style={styles.dateSummary}>
  <Text style={styles.dateText}>
    Start: {selectedRange.start ? selectedRange.start.toDateString() : 'Not selected'}
  </Text>
  <Text style={styles.dateText}>
    End: {selectedRange.end ? selectedRange.end.toDateString() : 'Not selected'}
  </Text>
</View>



      <TextInput
        style={styles.descriptionInput}
        placeholder="Describe the items you are storing"
        value={reservationDescription}
        onChangeText={setReservationDescription}
        multiline
      />

            
      <TouchableOpacity
        style={[
          styles.confirmButton,
          (
            !selectedRange.start || 
            !selectedRange.end || 
            !reservationDescription.trim() || 
            booking
          ) && styles.disabledButton,
        ]}
        disabled={
          !selectedRange.start || 
          !selectedRange.end || 
          !reservationDescription.trim() || 
          booking
        }
        onPress={handleReservation}
      >
        <Text style={styles.confirmText}>
          {booking ? 'Booking...' : 'Confirm Reservation'}
        </Text>
      </TouchableOpacity>



    </View>

    <Text style={styles.questionText}>Have a question before booking?</Text>


<View style={styles.messageBox}>
  <TextInput
    style={styles.messageInput}
    placeholder="Send message..."
    value={message}
    onChangeText={setMessage}
    multiline
  />

  <TouchableOpacity
    onPress={sendMessage}
    disabled={!message.trim() || sending}
    style={[
      styles.sendButton,
      (!message.trim() || sending) && styles.disabledButton,
    ]}
  >
    <Text style={styles.sendText}>{sending ? 'Sending...' : 'Send'}</Text>
  </TouchableOpacity>
</View>




  </>
)}






    </ScrollView>
    </TouchableWithoutFeedback>

    </KeyboardAvoidingView>

  );
}









const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFCF1', // Soft wheat background
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageCarousel: {
    maxHeight: 200,
    marginBottom: 16,
  },

  image: {
    width: 320,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },

  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#0F6B5B',
    marginBottom: 8,
  },

  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },

  offeringTag: {
    backgroundColor: '#629447', // Earthy green
  },

  requestingTag: {
    backgroundColor: '#F3AF1D', // Mustard yellow
  },

  tagText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  description: {
    fontSize: 16,
    color: '#1F1F1F',
    fontFamily: 'Poppins-Regular',
    marginBottom: 12,
  },

  price: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F6B5B',
    marginBottom: 12,
  },

  label: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
    color: '#0F6B5B',
  },

  value: {
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },

  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ccc',
  },

  userName: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginRight: 10,
  },

  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#fff',
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },

  inlineTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 'auto',
    borderRadius: 12,
    justifyContent: 'center',
    alignSelf: 'center',
  },

  questionText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginVertical: 20,
    color: '#333',
  },
  
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 26,
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: 'transparent', // no white outer background
    gap: 8,
  },
  
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#FFFFFF', // white inside only
    maxHeight: 120,
  },
  

  sendButton: {
    backgroundColor: '#0F6B5B', // Emerald green
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  disabledButton: {
    backgroundColor: '#A0A0A0',
  },

  sendText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },

  mapContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },

  map: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },

  postalCode: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#444',
    textAlign: 'center',
  },

  bookingContainer: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },

  bookingTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F6B5B',
    marginBottom: 10,
  },

  dateInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },

  confirmButton: {
    backgroundColor: '#0F6B5B',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  confirmText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },

  noticeBox: {
    padding: 15,
    backgroundColor: '#fefae0',
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },

  noticeText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    textAlign: 'center',
  },
  dateSummary: {
    marginTop: 15,
    paddingVertical: 5,  // top & bottom padding
    paddingHorizontal: 0, // optional, you can add a little if needed
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4, // space between start and end
  },
  
  
  
});
