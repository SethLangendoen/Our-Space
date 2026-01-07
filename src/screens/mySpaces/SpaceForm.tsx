


import React, { useState } from 'react';
import { collection, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import * as Crypto from 'expo-crypto';
import { storage } from '../../firebase/config';
import { Alert } from 'react-native'; // Add this import if not already present
import BlockedCalendar from '../../components/BlockedCalendar';



import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const MAX_IMAGES = 5;


interface SpaceFormProps {
	mode: 'create' | 'edit';
	initialData?: any; // ideally you can type this
	onSubmit: (formData: any) => Promise<void>; // callback when form is submitted
  }
  

export default function SpaceForm({ mode, initialData, onSubmit }: SpaceFormProps) {

const [showStartPicker, setShowStartPicker] = useState(false);
const [showEndPicker, setShowEndPicker] = useState(false);

const [title, setTitle] = useState(initialData?.title || '');
const [description, setDescription] = useState(initialData?.description || '');
const [width, setWidth] = useState(initialData?.dimensions?.width || '');
const [length, setLength] = useState(initialData?.dimensions?.length || '');
const [height, setHeight] = useState(initialData?.dimensions?.height || '');
const [storageType, setStorageType] = useState(initialData?.storageType || null);
const [usageType, setUsageType] = useState<string[]>(initialData?.usageType || []);
const [postType, setPostType] = useState(initialData?.postType || null);
const [price, setPrice] = useState(initialData?.price || '');
const [address, setAddress] = useState(initialData?.address?.split(',')[0] || '');
const [postalCode, setPostalCode] = useState(initialData?.address?.split(',')[1]?.trim() || '');
const [accessibility, setAccessibility] = useState(initialData?.accessibility || null);
const [security, setSecurity] = useState(initialData?.security || []);
// const [deliveryMethod, setDeliveryMethod] = useState(initialData?.deliveryMethod || []);
const [images, setImages] = useState<string[]>(initialData?.images || []);
const [mainImage, setMainImage] = useState<string | null>(initialData?.mainImage || null);
const [priceFrequency, setPriceFrequency] = useState<
  'daily' | 'weekly' | 'monthly'
>(initialData?.priceFrequency || 'daily');

const [convertedPrices, setConvertedPrices] = useState<{ daily: number; weekly: number; monthly: number }>({
  daily: 0,
  weekly: 0,
  monthly: 0,
});



const [lengthDiscountPercent, setLengthDiscountPercent] = useState<number>(0);
const [lengthDiscountDays, setLengthDiscountDays] = useState<number | null>(null);



const [blockedTimes, setBlockedTimes] = useState<{ start: string; end: string }[]>(
  initialData?.blockedTimes || []
);

const [reservedTimes, setReservedTimes] = useState<{ start: string; end: string }[]>(
  initialData?.reservedTimes || [] // default to empty array if creating a new space
);









const navigation = useNavigation();


  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const HERE_APP_ID = 'pFKaPvfjrv5rKal9FLUM';
  const HERE_API_KEY = 'tUaFheXRcT-OB0IJJnXIHemVIYMOHALHYXDYV32XG4E';
  
  async function geocodeAddress(fullAddress: string) {
    try {
      const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${HERE_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch geocode data');
      }
      const data = await response.json();
  
      if (data.items && data.items.length > 0) {
        const location = data.items[0].position;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      } else {
        throw new Error('No geocode results found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }
  
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsLoggedIn(true);
      setUserId(user.uid);
    } else {
      setIsLoggedIn(false);
      setUserId(null);
    }
  });

  return unsubscribe;
}, []);



useEffect(() => {
  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) return;

  // Price is always daily
  const daily = priceNum;
  const weekly = priceNum * 7;
  const monthly = priceNum * 30;

  setConvertedPrices({
    daily: parseFloat(daily.toFixed(2)),
    weekly: parseFloat(weekly.toFixed(2)),
    monthly: parseFloat(monthly.toFixed(2)),
  });
}, [price]);



function getRangeDates(start: string, end: string): string[] {
  const result = [];
  let current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    result.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return result;
}






const generateUUID = async () => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-4${hex.substr(13, 3)}-a${hex.substr(16, 3)}-${hex.substr(19, 12)}`;
};

const getFileExtension = (uri: string) => {
  const match = uri.match(/\.(\w+)(\?.*)?$/);
  return match ? match[1] : 'jpg'; // default fallback
};


const uploadImageAsync = async (uri: string, userId: string): Promise<string> => {
  try {
    
    const response = await fetch(uri);
    console.log('fetch response: ', response)
    const blob = await response.blob();
    console.log(blob.size,'Blob Size: ', blob.type, 'Blob Type: ')

    const ext = getFileExtension(uri);
    const uuid = await generateUUID();
    console.log('User ID:', userId)
    const filename = `postPhotos/${userId}/${uuid}.${ext}`;
    console.log('File name: ' , filename)
    const imageRef = ref(storage, filename);

    const metadata = {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    };

    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
    


  } catch (error) {
    console.error('Upload error catch:', error);
    throw error;
  }


};



  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) return;
	let result = await ImagePicker.launchImageLibraryAsync({
		mediaTypes: ImagePicker.MediaTypeOptions.Images,
	  });
	  

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      console.log('Uploading URI:', uri);

      setImages([...images, uri]);
      if (!mainImage) setMainImage(uri);
    }
  };

  const removeImage = (uri: string) => {
    const updated = images.filter((img) => img !== uri);
    setImages(updated);
    if (mainImage === uri) setMainImage(updated[0] || null);
  };

  const prioritizeImage = (uri: string) => {
    setMainImage(uri);
  };





const handleSubmit = async () => {
	if (!userId) {
	  alert('You must be logged in.');
	  return;
	}

	try {
	  const fullAddress = `${address}, ${postalCode}`;
	  const coordinates = await geocodeAddress(fullAddress);
	  
	  const uploadedImageURLs: string[] = [];
  
	  for (const uri of images) {
		// If already a URL (edit mode), skip upload
		if (uri.startsWith('http')) {
		  uploadedImageURLs.push(uri);
		} else {
		  const url = await uploadImageAsync(uri, userId);
		  uploadedImageURLs.push(url);
		}
	  }
  
	  const mainImageURL = uploadedImageURLs[images.indexOf(mainImage!)];
  
	  const postData = {
		title,
		description,
		dimensions: { width, length, height },
		storageType,
		usageType,
		mainImage: mainImageURL,
		images: uploadedImageURLs,
		userId,
		postType,
		price,
    priceFrequency,
		address: fullAddress,
		location: coordinates,
		accessibility,
		security,
    blockedTimes: blockedTimes,
    reservedTimes,

		// deliveryMethod
	  };
  
	  await onSubmit(postData);
	} catch (error: any) {
	  console.error('Form submission error:', error);
	  alert(`Error: ${error.message}`);
	}
  };
  




  const handleDeletePost = () => {
	if (!initialData?.postId) {
	  alert('No post ID found.');
	  return;
	}
  
	Alert.alert(
	  'Delete Post',
	  'Are you sure you want to delete this post? This action cannot be undone.',
	  [
		{
		  text: 'Cancel',
		  style: 'cancel',
		},
		{
		  text: 'Delete',
		  style: 'destructive',
		  onPress: async () => {
			try {
			  await deleteDoc(doc(db, 'spaces', initialData.postId));
			  alert('Post deleted successfully.');
			  navigation.goBack();
			} catch (error: any) {
			  console.error('Delete error:', error);
			  alert('Failed to delete the post. Please try again.');
			}
		  },
		},
	  ]
	);
  };
  



  return (

    
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
        <Text style={styles.addPhotoText}>Add Photo ({images.length}/{MAX_IMAGES})</Text>
      </TouchableOpacity>

      <View style={styles.imageGrid}>
        {images.map((uri) => (
          <TouchableOpacity key={uri} onPress={() => prioritizeImage(uri)} onLongPress={() => removeImage(uri)}>
            <Image source={{ uri }} style={[styles.image, mainImage === uri && styles.mainImage]} />
          </TouchableOpacity>
        ))}
      </View>


      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Description"
        multiline
        value={description}
        onChangeText={setDescription}
      />

<TextInput
  style={styles.input}
  placeholder="Address"
  value={address}
  onChangeText={setAddress}
/>

<TextInput
  style={styles.input}
  placeholder="Postal Code"
  value={postalCode}
  onChangeText={setPostalCode}
/>



<View style={styles.sizeContainer}>
  <TextInput
    style={styles.sizeInput}
    placeholder="Width (ft)"
    value={width}
    onChangeText={setWidth}
    keyboardType="numeric"
  />
  <TextInput
    style={styles.sizeInput}
    placeholder="Length (ft)"
    value={length}
    onChangeText={setLength}
    keyboardType="numeric"
  />
  <TextInput
    style={styles.sizeInput}
    placeholder="Height (ft)"
    value={height}
    onChangeText={setHeight}
    keyboardType="numeric"
  />
</View>



{/* <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
  
  <TextInput
    style={[styles.sizeInput, { flex: 1 }]}
    placeholder="Daily Price"
    value={price}
    onChangeText={setPrice}
    keyboardType="numeric"
  />

</View> */}

<View style={styles.priceRow}>
  <TextInput
    style={[styles.sizeInput, { flex: 1 }]}
    placeholder="Price"
    value={price}
    onChangeText={setPrice}
    keyboardType="numeric"
  />

  <View style={styles.frequencyGroup}>
    {(['daily', 'weekly', 'monthly'] as const).map(freq => {
      const selected = priceFrequency === freq;
      return (
        <TouchableOpacity
          key={freq}
          style={[
            styles.frequencyButton,
            selected && styles.frequencyButtonSelected,
          ]}
          onPress={() => setPriceFrequency(freq)}
        >
          <Text
            style={[
              styles.frequencyText,
              selected && styles.frequencyTextSelected,
            ]}
          >
            {freq.charAt(0).toUpperCase() + freq.slice(1)}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
</View>

<Text style={styles.priceHint}>
  Billed {priceFrequency}. Cancellation notice will match this frequency.
</Text>










<Text style={styles.sectionTitle}>Post Type</Text>
<View style={styles.optionRow}>
  {['Offering', 'Requesting'].map((type) => (
    <TouchableOpacity
      key={type}
      style={[
        styles.optionButton,
        postType === type && styles.optionSelected,
      ]}
      onPress={() => setPostType(type as 'Offering' | 'Requesting')}
    >
      <Text
        style={[
          styles.optionText,
          postType === type && styles.optionSelectedText,
        ]}
      >
        {type}
      </Text>
    </TouchableOpacity>
  ))}
</View>





{/* Accessibility (Radio Buttons) */}
<Text style={styles.sectionTitle}>Accessibility:</Text>
<View style={styles.optionRow}>
  {['1 day notice', '2+ days notice', '24/7'].map(option => {
    const selected = accessibility === option;
    return (
      <TouchableOpacity
        key={option}
        onPress={() => setAccessibility(option as any)}
        style={[styles.optionButton, selected && styles.optionSelected]}
      >
        <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>


{/* Security (Checkboxes) */}
<Text style={styles.sectionTitle}>Security:</Text>
<View style={styles.optionRow}>
{['Video Surveillance', 'Pinpad/Keys', 'Gated Area', 'Smoke Detectors'].map(option => {
    const selected = security.includes(option);
    return (
      <TouchableOpacity
        key={option}
        onPress={() =>
          setSecurity((prev: any[]) =>
            selected ? prev.filter(o => o !== option) : [...prev, option]
          )
        }
        style={[styles.optionButton, selected && styles.optionSelected]}
      >
        <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>











<Text style={styles.sectionTitle}>Storage Type</Text>
<View style={styles.optionRow}>
  {['Indoor', 'Outdoor', 'Climate-Controlled'].map((type) => (
    <TouchableOpacity
      key={type}
      style={[
        styles.optionButton,
        storageType === type && styles.optionSelected,
      ]}
      onPress={() => setStorageType(type as typeof storageType)}
    >
      <Text
        style={[
          styles.optionText,
          storageType === type && styles.optionSelectedText,
        ]}
      >
        {type}
      </Text>
    </TouchableOpacity>
  ))}
</View>

<Text style={styles.sectionTitle}>Usage Type</Text>
<View style={styles.optionRow}>

{['Cars/Trucks', 'RV', 'Boats', 'Personal', 'Business'].map((type) => {
  const selected = usageType.includes(type);
  return (
    <TouchableOpacity
      key={type}
      style={[styles.optionButton, selected && styles.optionSelected]}
      onPress={() =>
        setUsageType(prev =>
          selected ? prev.filter(t => t !== type) : [...prev, type]
        )
      }
    >
      <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
        {type}
      </Text>
    </TouchableOpacity>
  );
})}

</View>


<Text style={styles.sectionTitle}>Blocked Times</Text>

<BlockedCalendar
  blockedTimes={blockedTimes}
  reservedTimes={reservedTimes}
  onAddBlockedTime={(time) => setBlockedTimes([...blockedTimes, time])}
  onRemoveBlockedTime={(index) =>
    setBlockedTimes(blockedTimes.filter((_, i) => i !== index))
  }
  editable={true}
/>







	<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
		<Text style={styles.submitText}>
			{mode === 'edit' ? 'Update Space' : 'Create Space'}
		</Text>
	</TouchableOpacity>

	{mode === 'edit' && initialData?.postId && (
		<TouchableOpacity
			style={[styles.submitButton, { backgroundColor: 'red', marginTop: 10 }]}
			onPress={handleDeletePost}
		>
			<Text style={[styles.submitText, { color: 'white' }]}>Delete Post</Text>
		</TouchableOpacity>
	)}



    </ScrollView>
  );
}







const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFCF1', // Wheat/Cream background for softness
  },
  addPhotoButton: {
    backgroundColor: '#0F6B5B', // Emerald Green primary action
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  addPhotoText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 6,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mainImage: {
    borderColor: '#0F6B5B', // Emerald Green highlight for selected image
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1F1F1F',
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sizeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 0,
    backgroundColor: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1F1F1F',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 10,
    color: '#0F6B5B', // Emerald Green for section headings
    fontFamily: 'Poppins-Bold',
  },

  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#629447', // Earthy Green for border on tabs
    backgroundColor: 'transparent',
    margin: 4,
  },
  activeTabButton: {
    backgroundColor: '#0F6B5B', // Emerald Green active background
    borderColor: '#0F6B5B',
  },
  tabText: {
    color: '#629447', // Earthy Green text for inactive tabs
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  activeTabText: {
    color: '#fff', // White text for active tab
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },

  submitButton: {
    backgroundColor: '#0F6B5B', // Emerald Green primary button
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 8,
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  optionText: {
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Poppins-SemiBold',
  },
  optionSelected: {
    backgroundColor: '#0F6B5B', // Emerald Green selected background
    borderColor: '#0F6B5B',
  },
  optionSelectedText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  blockedTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
  },
  promoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  
  frequencyGroup: {
    flexDirection: 'row',
  },
  
  frequencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginLeft: 4,
    backgroundColor: '#FFF',
  },
  
  frequencyButtonSelected: {
    backgroundColor: '#0F6B5B',
    borderColor: '#0F6B5B',
  },
  
  frequencyText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#1F1F1F',
    fontSize: 14,
  },
  
  frequencyTextSelected: {
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
  },
  
  priceHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  
  
});
