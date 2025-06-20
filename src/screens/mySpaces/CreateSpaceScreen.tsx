


import React, { useState } from 'react';
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

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) return;
	let result = await ImagePicker.launchImageLibraryAsync({
		mediaTypes: ImagePicker.MediaTypeOptions.Images,
	  });
	  

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
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


  const handleCreatePost = async () => {
	// const auth = getAuth();
	// const user = auth.currentUser;
  
	// if (!user) {
	//   alert('You must be logged in to create a post.');
	//   return;
	// }
  
	// const postData = {
	//   title,
	//   description,
	//   startDate,
	//   endDate,
	//   width,
	//   length,
	//   height,
	//   storageType,
	//   usageType,
	//   mainImage,
	//   images,
	//   userId: user.uid,
	// };
  
	// try {
	//   const postId = await createPost(user.uid, postData);
	//   alert(`Post created with ID: ${postId}`);
	//   // You can navigate away or reset form here
	// } catch (error) {
	//   alert('Failed to create post. Please try again.');
	//   console.error(error);
	// }
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

      <TouchableOpacity style={styles.submitButton}>
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
