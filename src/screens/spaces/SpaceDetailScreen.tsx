
import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, TextInput, Platform, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addDoc, collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { AuthError } from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BlockedCalendar from 'src/components/BlockedCalendar';
// import DateTimePicker from '@react-native-community/datetimepicker';

import { KeyboardAvoidingView, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS } from '../Styles/theme';
import FeatureRow from 'src/components/FeatureRow';
import ImageCarousel from './ImageCarousel';
import { Ionicons } from '@expo/vector-icons';

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
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [booking, setBooking] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [reservationDescription, setReservationDescription] = useState('');
  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;
  const [storageDuration, setStorageDuration] = useState('');
  const [selectedPricePeriod, setSelectedPricePeriod] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [showRequestUI, setShowRequestUI] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [reservationId, setReservationId] = useState(String)
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [showMessageUI, setShowMessageUI] = useState(false);

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


  // NOT DONE YET
  useEffect(() => {
    console.log('checking existing request')
    const checkExistingRequest = async () => {
      if (!currentUser || !space?.id) return;

      const q = query(
        collection(db, 'reservations'),
        where('requesterId', '==', currentUser),
        where('spaceId', '==', space.id),
        where('status', 'in', [
          'requested',
          'awaiting_acceptance',
          'confirmed'
        ]),
        limit(1)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        console.log('found a request')
        setHasRequested(true);
        setReservationId(snap.docs[0].id);
      } else {
        setHasRequested(false);
        console.log('did not find a request')
      }
    };
  
    checkExistingRequest();
  }, [currentUser, space?.id, hasRequested]);




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
      if (!currentUser || !selectedRange.start || !space?.id || currentUser === space.userId) return;
    
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
        const priceValue =
          selectedPricePeriod && space.prices[selectedPricePeriod]?.amount
            ? parseFloat(space.prices[selectedPricePeriod].amount)
            : null;
    
        const contractData = {
          userId: currentUser,
          requestedAt: Timestamp.now(),
          startDate: Timestamp.fromDate(selectedRange.start),
          endDate: null, // TBD until contract phase
          state: 'requested',
          description: reservationDescription,
          storageDuration, 
          pricePeriod: selectedPricePeriod,
          price: priceValue,
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
          endDate: selectedRange.end
          ? Timestamp.fromDate(selectedRange.end)
          : null,          description: reservationDescription,
          createdAt: serverTimestamp(),
          status: 'requested',
          storageDuration, 
          pricePeriod: selectedPricePeriod,
          price: priceValue,
        });
    
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
        setShowRequestUI(false)
        setReservationSuccess(true);
        setReservationId(reservationRef.id)
        setHasRequested(true);

      } catch (err) {
        console.error('Reservation Error:', err);
        Alert.alert('Error', 'Could not submit reservation.');
      } finally {
        setBooking(false);
      }
    };
    

    // Create a local constant that is only set if start exists
const startDate = selectedRange.start;

// Helper to normalize Firestore Timestamps / Dates / strings to JS Dates
const toJSDate = (d: any): Date => {
  if (!d) return new Date();
  if (typeof d.toDate === 'function') return d.toDate();
  if (d instanceof Date) return d;
  return new Date(d);
};

// Then compute futureBlocked
const futureBlocked = startDate
  ? [
      ...(space.blockedTimes || []),
      ...(space.reservedTimes || []).map((rt: { startDate: any; endDate: any; }) => ({
        start: toJSDate(rt.startDate),
        end: toJSDate(rt.endDate),
      })),
    ].some(bt => bt.start > startDate)
  : false;

  
  const isOpenEnded = !!selectedRange.start && !selectedRange.end;
  const invalidOpenEndedBooking = isOpenEnded && futureBlocked;



  const formatTotalTimeBooked = (ms?: number) => {
    if (!ms || ms <= 0) return null;
  
    const totalHours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
  
    if (days > 0) {
      return `${days}d${hours > 0 ? ` ${hours}h` : ''}`;
    }
  
    return `${totalHours}h booked`;
  };
  const totalTimeLabel = formatTotalTimeBooked(space.totalTimeBooked);
  


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
        // <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
        //   {images.map((uri: string, index: number) => (
        //     <Image
        //       key={index}
        //       source={{ uri }}
        //       style={styles.image}
        //       resizeMode="cover"
        //     />
        //   ))}
        // </ScrollView>
        <ImageCarousel images={images} />
      )}

      


{space.location.lat && space.location.lng && (
  <View style={styles.mapContainer} pointerEvents="none">
  <MapView
      provider={mapProvider}      
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
    if (space?.userId && space.userId !== auth.currentUser?.uid) {
      // Only navigate if it's NOT your own profile
      navigation.navigate('UserProfile', { userId: space.userId });
    }
    // else do nothing
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
  </View>
</TouchableOpacity>



      <Text style={styles.title}>{space.title || 'No Title'}</Text>


      {space.description && <Text style={styles.description}>{space.description}</Text>}
      

{space.prices && (
  <View style={styles.priceContainer}>
    {(['daily', 'weekly', 'monthly'])
      .filter((period) => space.prices[period]?.enabled)
      .map((period) => {
        const data = space.prices[period];
        if (!data) return null;

        const amount = parseFloat(data.amount || '0');
        const formattedAmount = amount.toLocaleString('en-CA', {
          style: 'currency',
          currency: 'CAD',
          minimumFractionDigits: 2,
        });

        return (
          <View key={period} style={styles.priceRow}>
            <Text style={styles.priceText}>{formattedAmount}</Text>
            <Text style={styles.periodText}>
              {' '}{period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
            {data.isPublic && (
              <View style={styles.prioritizedBadge}>
                <Text style={styles.prioritizedText}>Prioritized</Text>
              </View>
            )}
          </View>
        );
      })}
  </View>
)}

{totalTimeLabel && (
  <View style={styles.infoRow}>
    <Text style={styles.label}>Total Time Booked:</Text>
    <Text style={styles.value}>{totalTimeLabel}</Text>
  </View>
)}

<View style={styles.infoRow}>
  <Text style={styles.label}>Location:</Text>
  <Text style={styles.value}>
    {space.location?.district ? `${space.location.district}, ` : ''}
    {space.location?.city || 'Unknown'}
  </Text>
</View>

<View style={styles.infoRow}>
  <Text style={styles.label}>Space Size:</Text>
  <Text style={styles.value}>
    {space.dimensions?.width || '?'}ft (W) × {space.dimensions?.length || '?'}ft (L) × {space.dimensions?.height || '?'}ft (H)
  </Text>
</View>

<View style={styles.infoRow}>
  <Text style={styles.label}>Accessibility:</Text>
  <View style={{ flexDirection: 'column' }}>
    {space.accessibility?.includes('By Appointment') && (
      <Text style={styles.value}>• Appointments are required for space visits</Text>
    )}
    {space.accessibility?.includes('24/7') && (
      <Text style={styles.value}>• Visits can be made at any time</Text>
    )}
    {!space.accessibility?.length && (
      <Text style={styles.value}>• Not specified</Text>
    )}
  </View>
</View>


      <Text style={styles.featureTitle}>
        Ideal Space For
      </Text>

      <View style={styles.featuresGrid}>
        {space.usageType?.map((type: string) => (
          <FeatureRow key={type} label={type} />
        ))}
      </View>

      <Text style={styles.featureTitle}>
        Space Features
      </Text>
        
      <View style={styles.featuresGrid}>
        {space.storageType.map((item: string) => (
          <FeatureRow key={item} label={item} />
        ))}        
        
        <FeatureRow label={space.accessibility} />

        {space.security.map((item: string) => (
          <FeatureRow key={item} label={item} />
        ))}
      </View>





  <View >
    
    {/* <TouchableOpacity
      style={styles.requestButton}
      onPress={() => {
        setShowRequestUI(true);
        setShowMessageUI(false);
      }}
    >
      <Text style={styles.requestButtonText}>
        Request This Space
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.messageHostButton}
      onPress={() => {
        setShowMessageUI(true);
        setShowRequestUI(false);
      }}
    >
      <Text style={styles.messageHostText}>
        Message Host
      </Text>
    </TouchableOpacity>

  </View> */}


{!currentUser ? (
  <View style={styles.noticeBox}>
    <Text style={styles.noticeText}>
      Log in to book space reservations or message the owner
    </Text>
  </View>
) : currentUser === space.userId ? (
  <View style={styles.noticeBox}>
    <Text style={styles.noticeText}>You Posted This Space</Text>
  </View>

) : (


<>

{!showRequestUI && (
  <TouchableOpacity
    style={styles.requestButton}
    onPress={() => {
      if (hasRequested && reservationId) {
        navigation
          .getParent()
          ?.navigate('MySpaces', {
            screen: 'RequestDetailScreen',
            params: {
              reservationId,
            },
          });
        return;
      }

      setShowRequestUI(true);
    }}
  >
    <Text style={styles.requestButtonText}>
      {hasRequested ? 'View Your Booking Request' : 'Request This Space'}
    </Text>
  </TouchableOpacity>
)}



{showRequestUI && (

<>

<View style={styles.bookingContainer}>
<Text style={styles.bookingTitle}>Book Reservation</Text>



<BlockedCalendar
  // blockedTimes={space.blockedTimes || []}
  // reservedTimes={space.reservedTimes || []} 
  onSelectRange={(range) => setSelectedRange(range)}
  // editable={false}
  singleSelect={true}

/>

<View style={styles.dateSummary}>
{/* START */}
<View style={styles.dateRow}>
  <Text style={styles.dateLabel}>Start</Text>
  <Text style={styles.dateValue}>
    {selectedRange.start
      ? selectedRange.start.toDateString()
      : 'Not selected'}
  </Text>
</View>



</View>


{space.prices && (
<View style={{ marginVertical: 20, paddingBottom: 10 }}>
  <Text style={styles.label}>Select Pricing Period</Text>

  <View
    style={{
      flexDirection: 'row',
      flexWrap: 'wrap',     // ⬅️ allow buttons to wrap
      gap: 10,              // spacing between buttons
      marginTop: 8,
    }}
  >
    {(['daily', 'weekly', 'monthly'] as const)
      .filter(period => space.prices[period]?.enabled)
      .map(period => {
        const data = space.prices[period];
        if (!data) return null;

        const isSelected = selectedPricePeriod === period;

        return (
          <TouchableOpacity
            key={period}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: isSelected ? '#FFBA00' : '#eee',
              borderRadius: 6,
            }}
            onPress={() => setSelectedPricePeriod(period)}
          >
            <Text style={{ color: isSelected ? 'white' : 'black' }}>
              {period.charAt(0).toUpperCase() + period.slice(1)} (${parseFloat(data.amount || '0').toFixed(2)})
            </Text>
          </TouchableOpacity>
        );
      })}
  </View>
</View>
)}


<TextInput
  style={styles.descriptionInput}
  placeholder="Describe the items you are storing"
  value={reservationDescription}
  onChangeText={setReservationDescription}
  multiline
/>
<TextInput
  style={styles.descriptionInput}
  placeholder="Approximate storage duration (e.g., 2 weeks, 3 months)"
  value={storageDuration}
  onChangeText={setStorageDuration}
  multiline={false}
/>


<TouchableOpacity
style={[
  styles.confirmButton,
  (
    !selectedRange.start ||                   // start date
    !reservationDescription.trim() ||        // description of items
    !storageDuration.trim() ||               // ⬅️ approximate storage duration
    !selectedPricePeriod ||                  // ⬅️ selected pricing period
    booking ||
    invalidOpenEndedBooking
  ) && styles.disabledButton,
]}
disabled={
  !selectedRange.start ||
  !reservationDescription.trim() ||
  !storageDuration.trim() ||                 // ⬅️ disable if empty
  !selectedPricePeriod ||                    // ⬅️ disable if not selected
  booking ||
  invalidOpenEndedBooking
}
onPress={handleReservation}
>
<Text style={styles.confirmText}>
  {booking ? 'Sending Request...' : 'Request Space Reservation'}
</Text>


</TouchableOpacity>

</View>


</>

  
)}




  <TouchableOpacity
      style={styles.messageHostButton}
      onPress={() => {
        setShowMessageUI(true);
        // setShowRequestUI(false);
      }}
    >
      <Text style={styles.messageHostText}>
        Message Host
      </Text>
  </TouchableOpacity>


{showMessageUI && (
  <>

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
        <Text style={styles.sendText}>
          {sending ? 'Sending...' : 'Send'}
        </Text>
      </TouchableOpacity>
    </View>
  </>
)}

</>

)}



  </View>




    </ScrollView>

    


    </TouchableWithoutFeedback>



    {reservationSuccess && (
  <View style={styles.overlay}>
    <View style={styles.overlayCard}>

      {/* X button */}
      <TouchableOpacity
        onPress={() => setReservationSuccess(false)}
        style={styles.overlayCloseButton}
      >
        <Ionicons name="close" size={22} color="#333" />
      </TouchableOpacity>

      <Text style={styles.overlayTitle}>Request Sent 🎉</Text>

      <Text style={styles.overlayText}>
        Your reservation request has been sent to the host. You’ll be notified once it’s reviewed.
      </Text>

      <TouchableOpacity
        style={styles.overlayButtonSecondary}
        onPress={() => {
          setReservationSuccess(false);
          navigation.goBack();
        }}
      >
        <Text style={styles.overlayButtonSecondaryText}>
          Keep browsing spaces
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.overlayButtonPrimary}
        onPress={() => {
          setReservationSuccess(false);
          navigation
          .getParent()
          ?.navigate('MySpaces', {
            screen: 'RequestDetailScreen',
            params: {
              reservationId,
            },
          });        
        }}
      >
        <Text style={styles.overlayButtonPrimaryText}>
          Check booking request
        </Text>
      </TouchableOpacity>

    </View>
  </View>
)}


    </KeyboardAvoidingView>

  );
}









const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.lighterGrey, // Soft wheat background
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 22,
    marginTop: 20,
    fontWeight: '600'
  },

  imageCarousel: {
    maxHeight: 200,
    marginBottom: 16,
  },
  dateSummary: {
    marginTop: 12,
  },
  smallGreyText: {
    fontSize: 14,
    textAlign: 'left'
  },
  
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },

  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  
  
  dateLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  
  
  dateValue: {
    fontSize: 16,
    fontWeight: '400',
    color: 'darkGrey',
    textAlign: 'right',
    flexShrink: 1,
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
    fontWeight: '800'
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

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 6,
    alignItems: 'flex-start',
  },
  
  label: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#005337', // primary brand green
    marginRight: 6,
  },
  
  value: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    flexShrink: 1, // ensures text wraps nicely
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
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
  priceContainer: {
    marginVertical: 8,
  },
  
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  
  priceText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#005337', // Emerald Green for pricing
  },
  
  periodText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333',
  },
  
  prioritizedBadge: {
    backgroundColor: '#ffba00', // Mustard Yellow
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  
  prioritizedText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#fff',
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
    paddingVertical: 10,
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
    height: 150,
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
    marginTop: 10,
    marginBottom: 10,
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },

  bookingTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F6B5B',
    marginBottom: 10,
    textAlign: 'center',
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
    backgroundColor: '#fff',
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

  dateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4, // space between start and end
  },
  
  
  requestButton: {
    backgroundColor: '#FFBA00',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  
  requestButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  
  messageHostButton: {
    backgroundColor: '#eee',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  messageHostText: {
    fontWeight: '600',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  
  overlayCard: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  
  overlayTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  
  overlayText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  
  overlayButtonPrimary: {
    backgroundColor: '#FFBA00',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  
  overlayButtonPrimaryText: {
    color: 'white',
    fontWeight: '600',
  },
  
  overlayButtonSecondary: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  overlayButtonSecondaryText: {
    color: '#333',
    fontWeight: '500',
  },
  overlayCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 6,
    zIndex: 10,
  },
});

