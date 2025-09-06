

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
};

type EditProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'EditProfile'
>;

export default function EditProfileScreen() {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setBio(data.bio || '');
        setProfileImage(data.profileImage || null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You must allow access to your media library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // For square crop
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImageAsync = async (uri: string) => {
    try {
      setUploading(true);
      const user = auth.currentUser;
      if (!user) return null;

      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profileImages/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    }  catch (error: any) {
      setUploading(false);
      console.error('Image upload failed:', JSON.stringify(error, null, 2)); // ⬅️ Add this
      Alert.alert('Upload failed', error.message || 'Could not upload image.');
      return null;
    }
     finally {
      setUploading(false);
    }
  };

  const saveUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    let uploadedImageUrl = profileImage;

    if (profileImage && profileImage.startsWith('file')) {
      const url = await uploadImageAsync(profileImage);
      if (url) uploadedImageUrl = url;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          firstName,
          lastName,
          bio,
          profileImage: uploadedImageUrl || '',
        },
        { merge: true }
      );

      Alert.alert('Profile Updated', 'Your profile has been saved.');
      navigation.navigate('ProfileMain');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Something went wrong while saving your data.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.heading}>Edit Profile</Text> */}

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.placeholder]}>
            <Text style={{ color: '#888' }}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Tell people why you are using Our Space"
        placeholderTextColor="#999"
        value={bio}
        onChangeText={(text) => {
          if (text.length <= 150) setBio(text);
        }}
        multiline
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{bio.length}/150</Text>

      <TouchableOpacity style={styles.saveButton} onPress={saveUserData}>
        <Text style={styles.saveText}>{uploading ? 'Uploading...' : 'Save Profile'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginBottom: 16,
    marginTop: -10,
  },
});
