


import React, { useRef, useState } from 'react';
import { collection, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import * as Crypto from 'expo-crypto';
import { storage } from '../../firebase/config';
import { Alert } from 'react-native'; // Add this import if not already present
import BlockedCalendar from '../../components/BlockedCalendar';
import { Dimensions } from 'react-native';
import { FEATURE_ICONS } from 'constants/featureIcons'; // adjust path as needed

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDE_MARGIN = 16; // gap on left & right of carousel
const IMAGE_GAP = 12; // gap between images
const IMAGE_WIDTH = SCREEN_WIDTH - SIDE_MARGIN * 2; // image width leaves room on sides

const GOOGLE_PLACES_KEY =
  Constants.expoConfig?.extra?.GOOGLE_PLACES_KEY;
  
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
import { COLORS } from '../Styles/theme';
import { GooglePlacesAutocomplete } from 'node_modules/react-native-google-places-autocomplete/GooglePlacesAutocomplete';
import Constants from 'node_modules/expo-constants/build/Constants';
import { KeyboardAwareScrollView } from 'node_modules/react-native-keyboard-aware-scroll-view';
import { useFilterContext } from 'src/context/FilterContext';

const MAX_IMAGES = 5;


interface SpaceFormProps {
	mode: 'create' | 'edit';
	initialData?: any; // ideally you can type this
	onSubmit: (formData: any) => Promise<void>; // callback when form is submitted
  }
  
  type PricePeriod = 'daily' | 'weekly' | 'monthly';

interface PriceData {
  amount: string; // string to bind to TextInput
  isPublic: boolean;
  enabled: boolean; // NEW

}


export default function SpaceForm({ mode, initialData, onSubmit }: SpaceFormProps) {

const [title, setTitle] = useState(initialData?.title || '');
const [description, setDescription] = useState(initialData?.description || '');
const [width, setWidth] = useState(initialData?.dimensions?.width || '');
const [length, setLength] = useState(initialData?.dimensions?.length || '');
const [height, setHeight] = useState(initialData?.dimensions?.height || '');
const [storageType, setStorageType] = useState<string[]>(initialData?.storageType || []);
const [usageType, setUsageType] = useState<string[]>(initialData?.usageType || []);
const [postType, setPostType] = useState(initialData?.postType || null);
const [price, setPrice] = useState(initialData?.price || '');
const [address, setAddress] = useState(initialData?.address?.split(',')[0] || '');
const [postalCode, setPostalCode] = useState(initialData?.address?.split(',')[1]?.trim() || '');
const [accessibility, setAccessibility] = useState(initialData?.accessibility || null);
const [security, setSecurity] = useState(initialData?.security || []);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [isPublic, setIsPublic] = useState<boolean>(initialData?.isPublic ?? true);
const [images, setImages] = useState<string[]>(initialData?.images || []);
const [mainImage, setMainImage] = useState<string | null>(initialData?.mainImage || null);
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [userId, setUserId] = useState<string | null>(null);
const [locationAddress, setLocationAddress] = useState(address || '');
const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
const HERE_APP_ID = 'pFKaPvfjrv5rKal9FLUM';
const HERE_API_KEY = 'tUaFheXRcT-OB0IJJnXIHemVIYMOHALHYXDYV32XG4E';
const [priority, setPriority] = useState<PricePeriod>();

const periods: PricePeriod[] = ['daily', 'weekly', 'monthly'];

const initialPrices: Record<PricePeriod, PriceData> = periods.reduce((acc, period) => {
  const existing = initialData?.prices?.[period];
  acc[period] = {
    amount: existing?.amount || '',
    isPublic: existing?.isPublic ?? false,
    enabled: existing?.enabled ?? !!existing?.amount, // use saved flag if exists
  };
  return acc;
}, {} as Record<PricePeriod, PriceData>);

  // Ensure at least one public
  const hasPublic = periods.some(p => initialPrices[p].isPublic);
  if (!hasPublic && periods.length) {
    initialPrices[periods[0]].isPublic = true;
    initialPrices[periods[0]].enabled = true; // enable public if none
  }

const [prices, setPrices] = useState<Record<PricePeriod, PriceData>>(initialPrices);



const [blockedTimes, setBlockedTimes] = useState<{ start: string; end: string }[]>(
  initialData?.blockedTimes || []
);
const [reservedTimes, setReservedTimes] = useState<[]>(
  initialData?.reservedTimes || [] // default to empty array if creating a new space
);



const navigation = useNavigation();


async function geocodeAddress(fullAddress: string) {
  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
    fullAddress
  )}&apiKey=${HERE_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to geocode address');

  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error('No geocode results found');
  }

  const item = data.items[0];

  return {
    address: item.address.label,
    city: item.address.city || null,
    province: item.address.stateCode || item.address.state || null,
    postalCode: item.address.postalCode || null, 
    country: item.address.countryName || null,
    district:
      item.address.district ||
      item.address.subdistrict ||
      item.address.neighborhood ||
      null,
    lat: item.position.lat,
    lng: item.position.lng,
  };
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

const toggleEnabled = (period: PricePeriod) => {
  setPrices((prev) => {
    const updated = { ...prev };

    // Flip enabled
    updated[period].enabled = !updated[period].enabled;

    // ---- Case 1: Disabled a prioritized period ----
    if (!updated[period].enabled && updated[period].isPublic) {
      // Find first enabled period
      const firstEnabled = (Object.entries(updated) as [PricePeriod, PriceData][])
        .find(([_, data]) => data.enabled);

      // Reset all priorities
      (Object.keys(updated) as PricePeriod[]).forEach(
        (p) => (updated[p].isPublic = false)
      );

      if (firstEnabled) {
        const [newPublicPeriod] = firstEnabled;
        updated[newPublicPeriod].isPublic = true;
      }
    }

    // ---- Case 2: Enabling a period when nothing else is enabled ----
    if (updated[period].enabled) {
      const anyEnabled = (Object.values(updated) as PriceData[]).some(
        (d) => d.enabled
      );
      const anyPublic = (Object.values(updated) as PriceData[]).some(
        (d) => d.isPublic
      );

      if (!anyPublic) {
        // If nothing prioritized yet, make this one prioritized
        (Object.keys(updated) as PricePeriod[]).forEach(
          (p) => (updated[p].isPublic = false)
        );
        updated[period].isPublic = true;
      }
    }

    return updated;
  });
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



const MAX_IMAGES = 5;


const pickImage = async () => {
  if (images.length >= MAX_IMAGES) return;

  const remainingSlots = MAX_IMAGES - images.length;

  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert(
      'Permission Required',
      'Please allow access to your photo library to upload images.'
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], // updated Expo syntax
    allowsMultipleSelection: true,
    selectionLimit: remainingSlots,
    quality: 1,
  });

  if (!result.canceled && result.assets?.length > 0) {
    const newUris = result.assets.map((asset) => asset.uri);

    // Prevent overflow even if selectionLimit is ignored
    const updatedImages = [...images, ...newUris].slice(0, MAX_IMAGES);

    setImages(updatedImages);

    // First image becomes main automatically
    if (!mainImage && updatedImages.length > 0) {
      setMainImage(updatedImages[0]);
    }
  }
};







  const removeImage = (uri: string) => {
    const updated = images.filter((img) => img !== uri);
    setImages(updated);
    if (mainImage === uri) setMainImage(updated[0] || null);
  };
  



const handleSubmit = async () => {
  if (!userId) {
    alert('You must be logged in.');
    return;
  }

  // --- Validation ---
  const missingFields: string[] = [];

  if (!title?.trim()) missingFields.push('Title');
  if (!description?.trim()) missingFields.push('Description');
  if (!locationAddress?.trim()) missingFields.push('Address');
  if (!width || !length || !height) missingFields.push('Dimensions');

  // Prices: at least one enabled with amount
  const hasValidPrice = (Object.values(prices) as any[]).some(
    (p) => p.amount && p.amount.trim() !== ''
  );
  
  if (!hasValidPrice) missingFields.push('Price');

  if (!accessibility?.length) missingFields.push('Accessibility');
  if (!storageType?.length) missingFields.push('Storage Type');

  // --- Image validation ---
  if (!images || images.length === 0) {
    missingFields.push('At least one image');
  }
  if (!mainImage) {
    missingFields.push('Main image');
  }

  if (missingFields.length > 0) {
    alert(
      `Please fill in the following required fields:\n- ${missingFields.join('\n- ')}`
    );
    return; // stop submission
  }

  // --- Continue submission ---
  try {
    setIsSubmitting(true);

    let locationData;

    if (selectedLocation && locationAddress) {
      try {
        locationData = await geocodeAddress(locationAddress);
      } catch (err) {
        console.warn('Failed to geocode autocomplete address, falling back to lat/lng only');
        locationData = {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          postalCode: null,
          address: locationAddress,
          city: null,
          province: null,
          country: null,
          district: null,
        };
      }
    } else {
      const fullAddress = `${address}, ${postalCode}`;
      locationData = await geocodeAddress(fullAddress);
    }

    const uploadedImageURLs: string[] = [];

    for (const uri of images) {
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
      isPublic,
      prices,
      address: locationData.address,
      accessibility,
      security,
      blockedTimes,
      reservedTimes,
      location: {
        address: locationData.address,
        city: locationData.city,
        province: locationData.province,
        country: locationData.country,
        district: locationData.district,
        lat: locationData.lat,
        lng: locationData.lng,
        postalCode: locationData.postalCode,
      },
    };

    await onSubmit(postData);
  } catch (error: any) {
    console.error('Form submission error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    setIsSubmitting(false);
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

    
    // <ScrollView contentContainerStyle={styles.container} >

<KeyboardAwareScrollView
  contentContainerStyle={styles.container}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>



{/* Section Label */}
<Text style={styles.selectLabel}>Photos</Text>
<Text style={styles.dimensionLabel}>Add clear and accurate photos for your space</Text>

<ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.photoScrollContent}
    snapToInterval={IMAGE_WIDTH + IMAGE_GAP}
    snapToAlignment="start"
    decelerationRate="fast"
  >


<View style={styles.photoRow}>
  {/* Add Photo Square */}
  {images.length < MAX_IMAGES && (
    <TouchableOpacity
      style={styles.addPhotoSquare}
      onPress={pickImage}
    >
      <Text style={styles.addPhotoIcon}>＋</Text>
      <Text style={styles.addPhotoSquareText}>
        Add Photo
      </Text>
    </TouchableOpacity>
  )}


    {images.map((uri) => (
      <View key={uri} style={styles.imageSlide}>
        <Image source={{ uri }} style={styles.carouselImage} />

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeImage(uri)}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>

        {/* Main image indicator */}
        {mainImage === uri && (
          <View style={styles.mainBadge}>
            <Text style={styles.mainBadgeText}>Main</Text>
          </View>
        )}
      </View>
    ))}
</View>
</ScrollView>



{/* Title */}
<Text style={styles.selectLabel}>Title</Text>
<Text style={styles.dimensionLabel}>Create a short and descriptive title for your space</Text>

<TextInput
  style={styles.input}
  placeholder="Private Heated Garage"
  value={title}
  onChangeText={setTitle}
/>

{/* Description */}
<Text style={styles.selectLabel}>Description</Text>
<Text style={styles.dimensionLabel}>Create a short and accurate description for your space</Text>

<TextInput
  style={[styles.input, { height: 100 }]}
  placeholder="Single-car garage in a quiet neighborhood. Fits SUV or small truck. 24/7 
  access with keypad..."
  multiline
  value={description}
  onChangeText={setDescription}
/>

{/* Address */}
<Text style={styles.selectLabel}>Address</Text>
<Text style={styles.dimensionLabel}> Approximate location displayed until the booking is confirmed</Text>


<View style={styles.googleInputContainer}>
  <GooglePlacesAutocomplete
    placeholder="123 Main St NW"
    fetchDetails={true}
    disableScroll={true}
    query={{
      key: GOOGLE_PLACES_KEY,
      language: 'en',
      components: 'country:ca',
      types: 'geocode',
    }}
    onPress={(data, details = null) => {
      if (!details) return;

      setLocationAddress(data.description);
      setSelectedLocation({
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
      });
    }}
    textInputProps={{
      value: locationAddress,
      onChangeText: (text) => {
        setLocationAddress(text);
        setAddress(text.split(',')[0]);
      },
    }}
    styles={{
      container: {
        flex: 0,
      },
      textInputContainer: {
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        borderBottomWidth: 0,
      },
      textInput: {
        height: 52,
        marginTop: 0,
        marginBottom: 0,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        color: '#1F1F1F',
        textAlignVertical: 'top', // keeps text aligned like normal inputs
        backgroundColor: '#FFFFFF',
      },
      listView: {
        marginTop: 4,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D8DEE4',
      },
      row: {
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      description: {
        fontSize: 14,
        color: '#1F1F1F',
        fontFamily: 'Poppins-Regular',
      },
    }}
    enablePoweredByContainer={false}
  />
</View>




{/* Dimensions */}
<Text style={styles.selectLabel}>Dimensions </Text>
<Text style={styles.dimensionLabel}> All measurements in feet </Text>


<View style={styles.sizeContainer}>
  {/* Width */}
  <View style={styles.dimensionBox}>
    {/* <Text style={styles.dimensionLabel}>Width</Text> */}
    <TextInput
      style={styles.input}
      placeholder="width"
      value={width}
      onChangeText={setWidth}
      keyboardType="numeric"
    />
  </View>

  {/* Length */}
  <View style={styles.dimensionBox}>
    <TextInput
      style={styles.input}
      placeholder="length"
      value={length}
      onChangeText={setLength}
      keyboardType="numeric"
    />
  </View>

  {/* Height */}
  <View style={styles.dimensionBox}>
    <TextInput
      style={styles.input}
      placeholder="height"
      value={height}
      onChangeText={setHeight}
      keyboardType="numeric"
    />
  </View>
</View>



<Text style={styles.selectLabel}>Suitable For</Text>
<Text style={styles.sectionDescription}>
  Select what your space is suitable for storing.
</Text>


<View style={styles.optionRow}>
  {['Cars/Trucks', 'RV', 'Boats', 'Personal', 'Larger Items'].map((type) => {
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
        <Image
          source={FEATURE_ICONS[type]}
          style={[
            styles.optionIcon,
          ]}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.optionText,
            selected && styles.optionSelectedText
          ]}
        >
          {type}
        </Text>

      </TouchableOpacity>
    );
  })}
</View>





{/* 
<Text style={styles.selectLabel}>Visibility</Text>
<Text style={styles.sectionDescription}>
  Choose whether your space is publicly visible
</Text>
<View style={styles.optionRow}>
  {['Public', 'Private'].map(option => {
    const selected = (option === 'Public') === isPublic;
    return (
      <TouchableOpacity
        key={option}
        style={[styles.optionButton, selected && styles.optionSelected]}
        onPress={() => setIsPublic(option === 'Public')}
      >
        <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>


<Text style={styles.selectLabel}>Accessibility:</Text>
<Text style={styles.sectionDescription}>
  Choose how and when renters can access your space.
</Text>
<View style={styles.optionRow}>
  {['By Appointment', '24/7'].map(option => {
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


<Text style={styles.selectLabel}>Security:</Text>
<Text style={styles.sectionDescription}>
  Select the safety features available at your space.
</Text>

<View style={styles.optionRow}>
{['Video Surveillance', 'Pinpad/Keys', 'Gated Area', 'Smoke Detectors', 'Alarm System', 'On-Site Presence'].map(option => {
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


<Text style={styles.selectLabel}>Storage Type</Text>
<Text style={styles.sectionDescription}>
  Select the features and characteristics that best describe your space.
</Text>
<View style={styles.optionRow}>
  {[
    'Indoor',
    'Outdoor',
    'Climate-Controlled',
    'Drive-Up Access',
    'Ramp Access',
    'Electricity',
    'Well-Lit Area',
    'Short Term',
    'Long Term',
    'Private Space',
    'Weather Protected',
  ].map(type => {
    const selected = storageType.includes(type);

    return (
      <TouchableOpacity
        key={type}
        onPress={() =>
          setStorageType(prev =>
            selected
              ? prev.filter(t => t !== type)
              : [...prev, type]
          )
        }
        style={[
          styles.optionButton,
          selected && styles.optionSelected,
        ]}
      >
        <Text
          style={[
            styles.optionText,
            selected && styles.optionSelectedText,
          ]}
        >
          {type}
        </Text>
      </TouchableOpacity>
    );
  })}
</View> */}


{/* Accessibility */}
<Text style={styles.selectLabel}>Accessibility:</Text>
<Text style={styles.sectionDescription}>
  Choose how and when renters can access your space.
</Text>

<View style={styles.optionRow}>
  {['By Appointment', '24/7'].map(option => {
    const selected = accessibility === option;

    return (
      <TouchableOpacity
        key={option}
        onPress={() => setAccessibility(option as any)}
        style={[styles.optionButton, selected && styles.optionSelected]}
      >
        <Image
          source={FEATURE_ICONS[option]}
          style={styles.optionIcon}
          resizeMode="contain"
        />

        <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>


{/* Security */}
<Text style={styles.selectLabel}>Security:</Text>
<Text style={styles.sectionDescription}>
  Select the safety features available at your space.
</Text>

<View style={styles.optionRow}>
  {[
    'Video Surveillance',
    'Pinpad/Keys',
    'Gated Area',
    'Smoke Detectors',
    'Alarm System',
    'On-Site Presence',
  ].map(option => {
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
        <Image
          source={FEATURE_ICONS[option]}
          style={styles.optionIcon}
          resizeMode="contain"
        />

        <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>


{/* Storage Type */}
<Text style={styles.selectLabel}>Storage Type</Text>
<Text style={styles.sectionDescription}>
  Select the features and characteristics that best describe your space.
</Text>

<View style={styles.optionRow}>
  {[
    'Indoor',
    'Outdoor',
    'Climate-Controlled',
    'Drive-Up Access',
    'Ramp Access',
    'Electricity',
    'Well-Lit Area',
    'Short Term',
    'Long Term',
    'Private Space',
    'Weather Protected',
  ].map(type => {
    const selected = storageType.includes(type);

    return (
      <TouchableOpacity
        key={type}
        onPress={() =>
          setStorageType(prev =>
            selected
              ? prev.filter(t => t !== type)
              : [...prev, type]
          )
        }
        style={[styles.optionButton, selected && styles.optionSelected]}
      >
        <Image
          source={FEATURE_ICONS[type]}
          style={styles.optionIcon}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.optionText,
            selected && styles.optionSelectedText,
          ]}
        >
          {type}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>




{/* Visibility */}
<Text style={styles.selectLabel}>Visibility</Text>
<Text style={styles.sectionDescription}>
  Choose whether your space is publicly visible
</Text>

<View style={styles.optionRow}>
  {['Public', 'Private'].map(option => {
    const selected = (option === 'Public') === isPublic;

    return (
      <TouchableOpacity
        key={option}
        style={[styles.optionButton, selected && styles.optionSelected]}
        onPress={() => setIsPublic(option === 'Public')}
      >


        <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>



<Text style={styles.selectLabel}>Price</Text>
<Text style={styles.sectionDescription}>
  Set how much you want to charge for your space. You can specify daily, weekly, and monthly rates.
</Text>


<View style={styles.priceSection}>
  <View style={styles.priceHeaderRow}>
    {(['daily', 'weekly', 'monthly'] as PricePeriod[]).map((period) => (
      <Text key={period} style={styles.priceHeaderText}>
        {period.charAt(0).toUpperCase() + period.slice(1)}
      </Text>
    ))}
  </View>

  <View style={styles.priceRow}>
  {(['daily', 'weekly', 'monthly'] as PricePeriod[]).map((period) => {
    const data = prices[period];
    const enabled = !!data.amount?.trim();

    return (
      <TextInput
        key={period}
        style={[
          styles.input,
          styles.priceCell,
          !enabled && { opacity: 0.4 },
        ]}
        placeholder="$0"
        value={data.amount}
        onChangeText={(val) =>
          setPrices((prev) => ({
            ...prev,
            [period]: { ...prev[period], amount: val },
          }))
        }
        keyboardType="numeric"
      />
    );
  })}
</View>
  
{/* Shae */}

<Text style={styles.priorityLabel}>
  Prioritize one pricing option:
</Text>

<View style={styles.priorityRow}>
  {(['daily', 'weekly', 'monthly'] as PricePeriod[]).map((period) => (
    <TouchableOpacity
      key={period}
      style={[
        styles.priorityOption,
        priority === period && styles.priorityOptionSelected,
        !prices[period].amount?.trim() && { opacity: 0.3 },
      ]}
      onPress={() => {
        if (!prices[period].amount?.trim()) return;
      
        setPriority(period);
      
        setPrices(prev => {
          const updated = { ...prev };
      
          // Only one priority/public period at a time
          (Object.keys(updated) as PricePeriod[]).forEach(p => {
            updated[p] = {
              ...updated[p],
              isPublic: p === period,
            };
          });
      
          return updated;
        });
      }}
      disabled={!prices[period].amount?.trim()}
    >
      <Text
        style={[
          styles.priorityText,
          priority === period && styles.priorityTextSelected,
        ]}
      >
        {period.charAt(0).toUpperCase() + period.slice(1)}
      </Text>
    </TouchableOpacity>
  ))}
</View>


</View>




<TouchableOpacity
  style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]}
  onPress={handleSubmit}
  disabled={isSubmitting || isDeleting}
>
  <Text style={styles.submitText}>
    {isSubmitting
      ? (mode === 'edit' ? 'Updating post...' : 'Creating post...')
      : (mode === 'edit' ? 'Update Space' : 'Create Space')}
  </Text>
</TouchableOpacity>

{mode === 'edit' && initialData?.postId && (
  <TouchableOpacity
    style={[
      styles.submitButton,
      { backgroundColor: 'red', marginTop: 10 },
      isDeleting && { opacity: 0.6 },
    ]}
    onPress={handleDeletePost}
    disabled={isSubmitting || isDeleting}
  >
    <Text style={[styles.submitText, { color: 'white' }]}>
      {isDeleting ? 'Deleting post...' : 'Delete Post'}
    </Text>
  </TouchableOpacity>
)}


    {/* </ScrollView> */}
    </KeyboardAwareScrollView>
  );
}







const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.lighterGrey, // Wheat/Cream background for softness
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
    priceSection: {
    marginVertical: 0,
    paddingHorizontal: 0,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },

  priceHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  priceHeaderText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },

  
  priceCell: {
    flex: 1,
  },

  // Label for each period (Daily, Weekly, Monthly)
  priceLabel: {
    width: 80, // fixed width so inputs align
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
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
    borderColor: '#D8DEE4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1F1F1F',
  
    // subtle depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  dimensionBox: {
    flex: 1,
  },

  
  dimensionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  
  sizeInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#FFF',
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1F1F1F',
  },


  sectionTitle: {
    fontWeight: '700',
    fontSize: 26,
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

  // submitButton: {
  //   backgroundColor: '#0F6B5B', // Emerald Green primary button
  //   paddingVertical: 15,
  //   borderRadius: 6,
  //   alignItems: 'center',
  //   marginTop: 10,
  // },
  // submitText: {
  //   color: '#fff',
  //   fontWeight: '700',
  //   fontFamily: 'Poppins-Bold',
  // },

  submitButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F6B5B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  submitText: {
    color: '#0F6B5B',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    fontWeight: '800',
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  optionButton: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8DEE4',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  optionText: {
    fontWeight: '500',
    color: '#2F3A45',
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  
  optionSelected: {
    backgroundColor: '#EAF4F1', // soft muted green
    borderColor: '#7BAA95',     // subtle green border
  },
  optionIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  
  optionSelectedText: {
    color: '#0F6B5B',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
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

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  
  priceHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  carouselContainer: {
    height: 'auto',
    marginBottom: 16,
  },
  
  // imageSlide: {
  //   width: IMAGE_WIDTH * .5 ,
  //   height: 150,
  //   marginHorizontal: 8, // 👈 spacing between images
  //   borderRadius: 12,
  //   overflow: 'hidden',
  //   position: 'relative',
  // },
  
  // carouselImage: {
  //   width: '100%',
  //   height: '100%',
  //   resizeMode: 'cover',
  // },
  
  
  // deleteButton: {
  //   position: 'absolute',
  //   top: 12,
  //   right: 12,
  //   backgroundColor: 'rgba(0,0,0,0.6)',
  //   borderRadius: 16,
  //   width: 32,
  //   height: 32,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  
  // deleteText: {
  //   color: '#fff',
  //   fontSize: 18,
  //   fontWeight: '700',
  // },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  priorityLabel: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20
  },
  
  priorityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  
  priorityOptionSelected: {
    backgroundColor: '#0F6B5B',
    borderColor: '#0F6B5B',
  },
  
  priorityText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  
  priorityTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
 
  selectLabel: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F6B5B',
    marginBottom: 0,
    fontWeight: '800',
  },

  photoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20

  },

  addPhotoSquare: {
    width: 110,
    height: 110,
    borderWidth: 2,
    borderColor: '#0F6B5B',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#F8F8F8',
  },

  addPhotoIcon: {
    fontSize: 32,
    color: '#0F6B5B',
    lineHeight: 36,
    fontWeight: '300',
  },

  addPhotoSquareText: {
    marginTop: 4,
    fontSize: 12,
    color: '#0F6B5B',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },

  photoScrollContent: {
    alignItems: 'center',
    paddingRight: 20,
  },

  imageSlide: {
    width: 110,
    height: 110,
    marginRight: IMAGE_GAP,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },

  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D32F2F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  deleteText: {
    color: '#D32F2F',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    fontWeight: '800',
  },

  mainBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#F3AF1D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  mainBadgeText: {
    color: '#0F6B5B',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Poppins-Regular',
  },
  googleInputContainer: {
    borderWidth: 1,
    borderColor: '#D8DEE4',
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  
    overflow: 'hidden',
  },
  
});
