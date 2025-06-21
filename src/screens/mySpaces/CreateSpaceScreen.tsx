


import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
// import { v4 as uuidv4 } from 'uuid'; // for unique image names
import * as Crypto from 'expo-crypto';
import { storage } from '../../firebase/config';

// import { createPost } from '../../firebase/firestore/posts';
// import { getAuth } from 'firebase/auth';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const MAX_IMAGES = 5;

export default function CreateSpaceScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [storageType, setStorageType] = useState<'Indoor' | 'Outdoor' | 'Climate-Controlled' | null>(null);
  const [usageType, setUsageType] = useState<'Cars/Trucks' | 'RV' | 'Boats' | 'Personal' | 'Business' | null>(null);
  const [postType, setPostType] = useState<'Offering' | 'Requesting' | null>(null);
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

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


// const uploadImageAsync = async (uri: string, userId: string): Promise<string> => {
//   try {
//     const response = await fetch(uri);
//     const blob = await response.blob();
//     console.log('Blob size:', blob.size);

//     const storage = getStorage();
//     const ext = getFileExtension(uri);
//     const uuid = await generateUUID();
//     const filename = `${userId}/${uuid}.${ext}`;
//     const imageRef = ref(storage, filename);

//     await uploadBytes(imageRef, blob);
//     const downloadURL = await getDownloadURL(imageRef);
//     return downloadURL;
//   } catch (error) {
//     console.error('Upload error:', error);
//     throw error;
//   }
// };

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


  // const handleCreatePost = async () => {
  //   if (!userId) {
  //     alert('You must be logged in to create a post.');
  //     return;
  //   }
  
  //   if (
  //     !title || !description || !startDate || !endDate || !width || !length ||
  //     !height || !storageType || !usageType || !postType || !price || images.length === 0
  //   ) {
  //     alert('Please fill out all fields and add at least one image.');
  //     return;
  //   }
  
  //   try {
  //     // Upload images to Firebase Storage
  //     const uploadedImageURLs: string[] = [];
  
  //     for (const uri of images) {
  //       const url = await uploadImageAsync(uri, userId);
  //       uploadedImageURLs.push(url);
  //     }
  
  //     const mainImageURL = uploadedImageURLs[images.indexOf(mainImage!)];
  
  //     const postData = {
  //       title,
  //       description,
  //       startDate,
  //       endDate,
  //       dimensions: { width, length, height },
  //       storageType,
  //       usageType,
  //       mainImage: mainImageURL,
  //       images: uploadedImageURLs,
  //       createdAt: Timestamp.now(),
  //       userId,
  //       postType,
  //       price,
  //     };
  
  //     await addDoc(collection(db, 'spaces'), postData);
  //     alert('Post created successfully!');
  //     // Optionally reset form here
  //   } catch (error: any) {
  //       console.error('Error creating post:', error.code, error.message, error.customData);
  //     alert(`Upload error: ${error.message}`);
  //   }
  // };

  const handleCreatePost = async () => {
    if (!userId) {
      alert('You must be logged in to create a post.');
      return;
    }
  
    if (
      !title || !description || !startDate || !endDate || !width || !length ||
      !height || !storageType || !usageType || !postType || !price || images.length === 0 ||
      !address || !postalCode
    ) {
      alert('Please fill out all fields, add an address, postal code, and at least one image.');
      return;
    }
  
    try {
      // Geocode the address + postal code to get coordinates
      const fullAddress = `${address}, ${postalCode}`;
      const coordinates = await geocodeAddress(fullAddress);
  
      // Upload images to Firebase Storage
      const uploadedImageURLs: string[] = [];
  
      for (const uri of images) {
        const url = await uploadImageAsync(uri, userId);
        uploadedImageURLs.push(url);
      }
  
      const mainImageURL = uploadedImageURLs[images.indexOf(mainImage!)];
  
      const postData = {
        title,
        description,
        startDate,
        endDate,
        dimensions: { width, length, height },
        storageType,
        usageType,
        mainImage: mainImageURL,
        images: uploadedImageURLs,
        createdAt: Timestamp.now(),
        userId,
        postType,
        price,
        address: fullAddress,
        location: coordinates,  // { lat: ..., lng: ... }
      };
  
      await addDoc(collection(db, 'spaces'), postData);
      alert('Post created successfully!');
      // Optionally reset form here
    } catch (error: any) {
      console.error('Error creating post:', error.code, error.message, error.customData);
      alert(`Error: ${error.message}`);
    }
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




            
<View style={styles.tabContainer}>
  {['Offering', 'Requesting'].map((type) => (
    <TouchableOpacity
      key={type}
      style={[
        styles.tabButton,
        postType === type && styles.activeTabButton,
      ]}
      onPress={() => setPostType(type as 'Offering' | 'Requesting')}
    >
      <Text
        style={[
          styles.tabText,
          postType === type && styles.activeTabText,
        ]}
      >
        {type}
      </Text>
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


<TextInput
  style={styles.input}
  placeholder="Price ($)"
  value={price}
  onChangeText={setPrice}
  keyboardType="numeric"
/>

      <TextInput
        style={styles.input}
        placeholder="Start Date (YYYY-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
      />
      <TextInput
        style={styles.input}
        placeholder="End Date (YYYY-MM-DD)"
        value={endDate}
        onChangeText={setEndDate}
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

      <Text style={styles.sectionTitle}>Storage Type</Text>
      <View style={styles.tabContainer}>
        {['Indoor', 'Outdoor', 'Climate-Controlled'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tabButton,
              storageType === type && styles.activeTabButton,
            ]}
            onPress={() => setStorageType(type as typeof storageType)}
          >
            <Text
              style={[
                styles.tabText,
                storageType === type && styles.activeTabText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Usage Type</Text>
      <View style={styles.tabContainer}>
        {['Cars/Trucks', 'RV', 'Boats', 'Personal', 'Business'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tabButton,
              usageType === type && styles.activeTabButton,
            ]}
            onPress={() => setUsageType(type as typeof usageType)}
          >
            <Text
              style={[
                styles.tabText,
                usageType === type && styles.activeTabText,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleCreatePost}>
        <Text style={styles.submitText}>Create Space</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  addPhotoButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  addPhotoText: {
    color: '#fff',
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
    borderColor: '#007bff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sizeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 10,
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
    borderColor: '#7b7b7b',
    backgroundColor: 'transparent',
    margin: 4,
  },
  activeTabButton: {
    backgroundColor: '#7b7b7b',
  },
  tabText: {
    color: '#7b7b7b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
