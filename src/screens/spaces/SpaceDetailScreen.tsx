
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AuthError } from 'expo-auth-session';

type RootStackParamList = {
  Spaces: undefined;
  Filters: undefined;
  SpaceDetail: { spaceId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'SpaceDetail'>;

export default function SpaceDetailScreen({ route }: Props) {
  const { spaceId } = route.params;
  const [space, setSpace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);


//   useEffect(() => {
//     const fetchSpace = async () => {
//       try {
//         const docRef = doc(db, 'spaces', spaceId);
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           setSpace(docSnap.data());
//         } else {
//           console.log('No such document!');
//         }
//       } catch (error) {
//         console.error('Error fetching space:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSpace();
//   }, [spaceId]);



useEffect(() => {
	const fetchSpaceAndUser = async () => {
	  try {
		const docRef = doc(db, 'spaces', spaceId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
		  const spaceData = docSnap.data();
		  setSpace(spaceData);
  
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

  return (
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


      <Text style={styles.title}>{space.title || 'No Title'}</Text>


      {space.description && <Text style={styles.description}>{space.description}</Text>}

      {space.price && (
        <Text style={styles.price}>Price: ${parseFloat(space.price).toFixed(2)}</Text>
      )}

      <Text style={styles.label}>
        Date Created: <Text style={styles.value}>{formatDate(space.createdAt)}</Text>
      </Text>

      <Text style={styles.label}>
        Dates Available: <Text style={styles.value}>{space.datesAvailable || 'N/A'}</Text>
      </Text>

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
        Usage Type: <Text style={styles.value}>{space.usageType || 'N/A'}</Text>
      </Text>


	  <Text style={styles.label}>
  Billing Frequency: <Text style={styles.value}>{space.billingFrequency || 'N/A'}</Text>
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

<Text style={styles.label}>
  Delivery Method:
  <Text style={styles.value}>
    {' '}
    {space.deliveryMethod?.length > 0 ? space.deliveryMethod.join(', ') : 'N/A'}
  </Text>
</Text>

<Text style={styles.label}>
  Dimensions:
  <Text style={styles.value}>
    {' '}
    {space.dimensions?.width || '?'}ft (W) × {space.dimensions?.length || '?'}ft (L) × {space.dimensions?.height || '?'}ft (H)
  </Text>
</Text>





    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageCarousel: { maxHeight: 200, marginBottom: 16 },
  image: { width: 320, height: 200, borderRadius: 8, marginRight: 12 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  offeringTag: { backgroundColor: '#4CAF50' },
  requestingTag: { backgroundColor: '#F44336' },
  tagText: { color: '#fff', fontWeight: '600' },
  description: { fontSize: 16, color: '#444', marginBottom: 12 },
  price: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, color: '#333' },
  value: { fontWeight: 'normal', color: '#555' },

  userRow: {
	flexDirection: 'row',
	alignItems: 'center', 
	marginBottom: 16,
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
	fontWeight: '600',
	marginRight: 10, // gives space before the tag
  },
  
  inlineTag: {
	paddingVertical: 4,  // Try lowering this to 2 or even 0 if needed
	paddingHorizontal: 10,
	marginLeft: 'auto',
	borderRadius: 12,
	justifyContent: 'center', // Optional: helps if you're seeing odd spacing
	alignSelf: 'center',      // ✅ forces it to center in parent row
  },
  
  
  
});
