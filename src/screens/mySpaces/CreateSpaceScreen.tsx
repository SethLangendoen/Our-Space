


// import React, { useState } from 'react';
// import { collection, addDoc, Timestamp } from 'firebase/firestore';
// import { auth, db } from '../../firebase/config';
// import { onAuthStateChanged } from 'firebase/auth';
// import { useEffect } from 'react';
// import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
// import * as FileSystem from 'expo-file-system';
// // import { v4 as uuidv4 } from 'uuid'; // for unique image names
// import * as Crypto from 'expo-crypto';
// import { storage } from '../../firebase/config';
// import DateTimePicker from '@react-native-community/datetimepicker';

// // import { createPost } from '../../firebase/firestore/posts';
// // import { getAuth } from 'firebase/auth';

// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Image,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';

// const MAX_IMAGES = 5;

// export default function CreateSpaceScreen() {
//   const [images, setImages] = useState<string[]>([]);
//   const [mainImage, setMainImage] = useState<string | null>(null);
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   // const [startDate, setStartDate] = useState('');
//   // const [endDate, setEndDate] = useState('');
//   const [width, setWidth] = useState('');
//   const [length, setLength] = useState('');
//   const [height, setHeight] = useState('');
//   const [storageType, setStorageType] = useState<'Indoor' | 'Outdoor' | 'Climate-Controlled' | null>(null);
//   const [usageType, setUsageType] = useState<'Cars/Trucks' | 'RV' | 'Boats' | 'Personal' | 'Business' | null>(null);
//   const [postType, setPostType] = useState<'Offering' | 'Requesting' | null>(null);
//   const [price, setPrice] = useState('');
//   const [address, setAddress] = useState('');
//   const [postalCode, setPostalCode] = useState('');

//   // Billing Frequency (one selection)
// const [billingFrequency, setBillingFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | null>(null);

// // Accessibility (one selection)
// const [accessibility, setAccessibility] = useState<'1 day notice' | '2+ days notice' | '24/7' | null>(null);

// // Security (checkboxes — zero or more)
// const [security, setSecurity] = useState<string[]>([]); // ['Video Surveillance', 'Pinpad/Keys']

// // Start Date
// const [startDateNegotiable, setStartDateNegotiable] = useState<boolean>(false);
// // const [startDate, setStartDate] = useState<string>(''); // or formatted date string (YYYY-MM-DD)

// // End Date
// const [endDateNegotiable, setEndDateNegotiable] = useState<boolean>(false);
// // const [endDate, setEndDate] = useState<string>('');

// const [startDate, setStartDate] = useState<Date | null>(null);
// const [endDate, setEndDate] = useState<Date | null>(null);

// const [showStartPicker, setShowStartPicker] = useState(false);
// const [showEndPicker, setShowEndPicker] = useState(false);


// // Delivery (radio): either 'Pickup' or 'Delivery'
// const [deliveryMethod, setDeliveryMethod] = useState<string[]>([]);


//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const HERE_APP_ID = 'pFKaPvfjrv5rKal9FLUM';
//   const HERE_API_KEY = 'tUaFheXRcT-OB0IJJnXIHemVIYMOHALHYXDYV32XG4E';
  
//   async function geocodeAddress(fullAddress: string) {
//     try {
//       const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${HERE_API_KEY}`;
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error('Failed to fetch geocode data');
//       }
//       const data = await response.json();
  
//       if (data.items && data.items.length > 0) {
//         const location = data.items[0].position;
//         return {
//           lat: location.lat,
//           lng: location.lng,
//         };
//       } else {
//         throw new Error('No geocode results found');
//       }
//     } catch (error) {
//       console.error('Geocoding error:', error);
//       throw error;
//     }
//   }
  
// useEffect(() => {
//   const unsubscribe = onAuthStateChanged(auth, (user) => {
//     if (user) {
//       setIsLoggedIn(true);
//       setUserId(user.uid);
//     } else {
//       setIsLoggedIn(false);
//       setUserId(null);
//     }
//   });

//   return unsubscribe;
// }, []);


// const generateUUID = async () => {
//   const randomBytes = await Crypto.getRandomBytesAsync(16);
//   const hex = Array.from(randomBytes)
//     .map((b) => b.toString(16).padStart(2, '0'))
//     .join('');
//   return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-4${hex.substr(13, 3)}-a${hex.substr(16, 3)}-${hex.substr(19, 12)}`;
// };

// const getFileExtension = (uri: string) => {
//   const match = uri.match(/\.(\w+)(\?.*)?$/);
//   return match ? match[1] : 'jpg'; // default fallback
// };


// // const uploadImageAsync = async (uri: string, userId: string): Promise<string> => {
// //   try {
// //     const response = await fetch(uri);
// //     const blob = await response.blob();
// //     console.log('Blob size:', blob.size);

// //     const storage = getStorage();
// //     const ext = getFileExtension(uri);
// //     const uuid = await generateUUID();
// //     const filename = `${userId}/${uuid}.${ext}`;
// //     const imageRef = ref(storage, filename);

// //     await uploadBytes(imageRef, blob);
// //     const downloadURL = await getDownloadURL(imageRef);
// //     return downloadURL;
// //   } catch (error) {
// //     console.error('Upload error:', error);
// //     throw error;
// //   }
// // };

// const uploadImageAsync = async (uri: string, userId: string): Promise<string> => {
//   try {
    
//     const response = await fetch(uri);
//     console.log('fetch response: ', response)
//     const blob = await response.blob();
//     console.log(blob.size,'Blob Size: ', blob.type, 'Blob Type: ')

//     const ext = getFileExtension(uri);
//     const uuid = await generateUUID();
//     console.log('User ID:', userId)
//     const filename = `postPhotos/${userId}/${uuid}.${ext}`;
//     console.log('File name: ' , filename)
//     const imageRef = ref(storage, filename);

//     const metadata = {
//       contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
//     };

//     await uploadBytes(imageRef, blob);
//     const downloadURL = await getDownloadURL(imageRef);
//     return downloadURL;
    


//   } catch (error) {
//     console.error('Upload error catch:', error);
//     throw error;
//   }


// };



//   const pickImage = async () => {
//     if (images.length >= MAX_IMAGES) return;
// 	let result = await ImagePicker.launchImageLibraryAsync({
// 		mediaTypes: ImagePicker.MediaTypeOptions.Images,
// 	  });
	  

//     if (!result.canceled && result.assets?.length > 0) {
//       const uri = result.assets[0].uri;
//       console.log('Uploading URI:', uri);

//       setImages([...images, uri]);
//       if (!mainImage) setMainImage(uri);
//     }
//   };

//   const removeImage = (uri: string) => {
//     const updated = images.filter((img) => img !== uri);
//     setImages(updated);
//     if (mainImage === uri) setMainImage(updated[0] || null);
//   };

//   const prioritizeImage = (uri: string) => {
//     setMainImage(uri);
//   };



//   const handleCreatePost = async () => {
//     if (!userId) {
//       alert('You must be logged in to create a post.');
//       return;
//     }
  
//     if (
//       !title || !description || (!startDateNegotiable && !startDate) || (!endDateNegotiable && !endDate) ||
//       !width || !length || !height || !storageType || !usageType || !postType || !price ||
//       images.length === 0 || !address || !postalCode || !billingFrequency || !accessibility || deliveryMethod.length === 0

//     ) {
//       alert('Please fill out all required fields.');
//       return;
//     }
  
//     try {
//       const fullAddress = `${address}, ${postalCode}`;
//       const coordinates = await geocodeAddress(fullAddress);
  
//       const uploadedImageURLs: string[] = [];
  
//       for (const uri of images) {
//         const url = await uploadImageAsync(uri, userId);
//         uploadedImageURLs.push(url);
//       }
  
//       const mainImageURL = uploadedImageURLs[images.indexOf(mainImage!)];
  
//       const postData = {
//         title,
//         description,
//         dimensions: { width, length, height },
//         storageType,
//         usageType,
//         mainImage: mainImageURL,
//         images: uploadedImageURLs,
//         createdAt: Timestamp.now(),
//         userId,
//         postType,
//         price,
//         address: fullAddress,
//         location: coordinates,
  
//         billingFrequency,            // New field
//         accessibility,               // New field
//         security,                    // New field (array)
//         availability: {
//           startDate: startDateNegotiable ? 'Negotiable' : startDate,
//           endDate: endDateNegotiable ? 'Negotiable' : endDate,
//         },
//         deliveryMethod               // New field
//       };
  
//       await addDoc(collection(db, 'spaces'), postData);
//       alert('Post created successfully!');
//       // Optionally reset form here
//     } catch (error: any) {
//       console.error('Error creating post:', error.code, error.message, error.customData);
//       alert(`Error: ${error.message}`);
//     }
//   };
  



//   return (

    
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
//         <Text style={styles.addPhotoText}>Add Photo ({images.length}/{MAX_IMAGES})</Text>
//       </TouchableOpacity>

//       <View style={styles.imageGrid}>
//         {images.map((uri) => (
//           <TouchableOpacity key={uri} onPress={() => prioritizeImage(uri)} onLongPress={() => removeImage(uri)}>
//             <Image source={{ uri }} style={[styles.image, mainImage === uri && styles.mainImage]} />
//           </TouchableOpacity>
//         ))}
//       </View>




          

//       <TextInput
//         style={styles.input}
//         placeholder="Title"
//         value={title}
//         onChangeText={setTitle}
//       />
//       <TextInput
//         style={[styles.input, { height: 100 }]}
//         placeholder="Description"
//         multiline
//         value={description}
//         onChangeText={setDescription}
//       />

// <TextInput
//   style={styles.input}
//   placeholder="Address"
//   value={address}
//   onChangeText={setAddress}
// />

// <TextInput
//   style={styles.input}
//   placeholder="Postal Code"
//   value={postalCode}
//   onChangeText={setPostalCode}
// />


// <TextInput
//   style={styles.input}
//   placeholder="Price ($)"
//   value={price}
//   onChangeText={setPrice}
//   keyboardType="numeric"
// />



// <View style={styles.sizeContainer}>
//   <TextInput
//     style={styles.sizeInput}
//     placeholder="Width (ft)"
//     value={width}
//     onChangeText={setWidth}
//     keyboardType="numeric"
//   />
//   <TextInput
//     style={styles.sizeInput}
//     placeholder="Length (ft)"
//     value={length}
//     onChangeText={setLength}
//     keyboardType="numeric"
//   />
//   <TextInput
//     style={styles.sizeInput}
//     placeholder="Height (ft)"
//     value={height}
//     onChangeText={setHeight}
//     keyboardType="numeric"
//   />
// </View>






// <Text style={styles.sectionTitle}>Post Type</Text>
// <View style={styles.optionRow}>
//   {['Offering', 'Requesting'].map((type) => (
//     <TouchableOpacity
//       key={type}
//       style={[
//         styles.optionButton,
//         postType === type && styles.optionSelected,
//       ]}
//       onPress={() => setPostType(type as 'Offering' | 'Requesting')}
//     >
//       <Text
//         style={[
//           styles.optionText,
//           postType === type && styles.optionSelectedText,
//         ]}
//       >
//         {type}
//       </Text>
//     </TouchableOpacity>
//   ))}
// </View>


// {/* Billing Frequency (Radio Buttons) */}
// <Text style={styles.sectionTitle}>Billing Frequency:</Text>
// <View style={styles.optionRow}>
//   {['Daily', 'Weekly', 'Monthly'].map(freq => {
//     const selected = billingFrequency === freq;
//     return (
//       <TouchableOpacity
//         key={freq}
//         onPress={() => setBillingFrequency(freq as any)}
//         style={[styles.optionButton, selected && styles.optionSelected]}
//       >
//         <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
//           {freq}
//         </Text>
//       </TouchableOpacity>
//     );
//   })}
// </View>


// {/* Accessibility (Radio Buttons) */}
// <Text style={styles.sectionTitle}>Accessibility:</Text>
// <View style={styles.optionRow}>
//   {['1 day notice', '2+ days notice', '24/7'].map(option => {
//     const selected = accessibility === option;
//     return (
//       <TouchableOpacity
//         key={option}
//         onPress={() => setAccessibility(option as any)}
//         style={[styles.optionButton, selected && styles.optionSelected]}
//       >
//         <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
//           {option}
//         </Text>
//       </TouchableOpacity>
//     );
//   })}
// </View>


// {/* Security (Checkboxes) */}
// <Text style={styles.sectionTitle}>Security:</Text>
// <View style={styles.optionRow}>
//   {['Video Surveillance', 'Pinpad/Keys'].map(option => {
//     const selected = security.includes(option);
//     return (
//       <TouchableOpacity
//         key={option}
//         onPress={() =>
//           setSecurity(prev =>
//             selected ? prev.filter(o => o !== option) : [...prev, option]
//           )
//         }
//         style={[styles.optionButton, selected && styles.optionSelected]}
//       >
//         <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
//           {option}
//         </Text>
//       </TouchableOpacity>
//     );
//   })}
// </View>












//     <Text style={styles.sectionTitle}>Delivery Method:</Text>
// <View style={styles.optionRow}>
//   {['Pickup', 'Delivery'].map(option => {
//     const selected = deliveryMethod.includes(option);
//     return (
//       <TouchableOpacity
//         key={option}
//         onPress={() =>
//           setDeliveryMethod(prev =>
//             selected ? prev.filter(o => o !== option) : [...prev, option]
//           )
//         }
//         style={[styles.optionButton, selected && styles.optionSelected]}
//       >
//         <Text style={[styles.optionText, selected && styles.optionSelectedText]}>
//           {option}
//         </Text>
//       </TouchableOpacity>
//     );
//   })}
// </View>


// <Text style={styles.sectionTitle}>Storage Type</Text>
// <View style={styles.optionRow}>
//   {['Indoor', 'Outdoor', 'Climate-Controlled'].map((type) => (
//     <TouchableOpacity
//       key={type}
//       style={[
//         styles.optionButton,
//         storageType === type && styles.optionSelected,
//       ]}
//       onPress={() => setStorageType(type as typeof storageType)}
//     >
//       <Text
//         style={[
//           styles.optionText,
//           storageType === type && styles.optionSelectedText,
//         ]}
//       >
//         {type}
//       </Text>
//     </TouchableOpacity>
//   ))}
// </View>

// <Text style={styles.sectionTitle}>Usage Type</Text>
// <View style={styles.optionRow}>
//   {['Cars/Trucks', 'RV', 'Boats', 'Personal', 'Business'].map((type) => (
//     <TouchableOpacity
//       key={type}
//       style={[
//         styles.optionButton,
//         usageType === type && styles.optionSelected,
//       ]}
//       onPress={() => setUsageType(type as typeof usageType)}
//     >
//       <Text
//         style={[
//           styles.optionText,
//           usageType === type && styles.optionSelectedText,
//         ]}
//       >
//         {type}
//       </Text>
//     </TouchableOpacity>
//   ))}
// </View>






// <View>
//       {/* Availability Start */}
//       <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Start Date:</Text>
//       <TouchableOpacity
//   onPress={() => setStartDateNegotiable(!startDateNegotiable)}
//   style={[
//     styles.optionButton,
//     startDateNegotiable && styles.optionSelected,
//     { marginBottom: 10 },
//   ]}
// >
//   <Text
//     style={[
//       styles.optionText,
//       startDateNegotiable && styles.optionSelectedText,
//     ]}
//   >
//     {startDateNegotiable ? '☑️ ' : '⬜️ '}Negotiable
//   </Text>
// </TouchableOpacity>

//       {!startDateNegotiable && (
//         <>
//           <TouchableOpacity
//             onPress={() => setShowStartPicker(true)}
//             style={{
//               borderWidth: 1,
//               padding: 10,
//               marginBottom: 10,
//               borderRadius: 6,
//             }}
//           >
//             <Text>{startDate ? startDate.toISOString().split('T')[0] : 'Select Start Date'}</Text>
//           </TouchableOpacity>

//           {showStartPicker && (
//             <DateTimePicker
//               value={startDate || new Date()}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'inline' : 'default'}
//               onChange={(event, selectedDate) => {
//                 setShowStartPicker(false);
//                 if (selectedDate) setStartDate(selectedDate);
//               }}
//             />
//           )}
//         </>
//       )}

//       {/* Availability End */}
//       <Text style={{ fontWeight: 'bold', marginTop: 10 }}>End Date:</Text>
//       <TouchableOpacity
//   onPress={() => setEndDateNegotiable(!endDateNegotiable)}
//   style={[
//     styles.optionButton,
//     endDateNegotiable && styles.optionSelected,
//     { marginBottom: 10 },
//   ]}
// >
//   <Text
//     style={[
//       styles.optionText,
//       endDateNegotiable && styles.optionSelectedText,
//     ]}
//   >
//     {endDateNegotiable ? '☑️ ' : '⬜️ '}Negotiable
//   </Text>
// </TouchableOpacity>



//       {!endDateNegotiable && (
//         <>
//           <TouchableOpacity
//             onPress={() => setShowEndPicker(true)}
//             style={{
//               borderWidth: 1,
//               padding: 10,
//               marginBottom: 10,
//               borderRadius: 6,
//             }}
//           >
//             <Text>{endDate ? endDate.toISOString().split('T')[0] : 'Select End Date'}</Text>
//           </TouchableOpacity>

//           {showEndPicker && (
//             <DateTimePicker
//               value={endDate || new Date()}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'inline' : 'default'}
//               onChange={(event, selectedDate) => {
//                 setShowEndPicker(false);
//                 if (selectedDate) setEndDate(selectedDate);
//               }}
//             />
//           )}
//         </>
//       )}
//     </View>


//       <TouchableOpacity style={styles.submitButton} onPress={handleCreatePost}>
//         <Text style={styles.submitText}>Create Space</Text>
//       </TouchableOpacity>

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//   },
//   addPhotoButton: {
//     backgroundColor: '#000',
//     padding: 12,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   addPhotoText: {
//     color: '#fff',
//   },
//   imageGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 15,
//   },
//   image: {
//     width: 70,
//     height: 70,
//     borderRadius: 6,
//     margin: 5,
//     borderWidth: 2,
//     borderColor: 'transparent',
//   },
//   mainImage: {
//     borderColor: '#007bff',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 10,
//   },
//   sizeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   sizeInput: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     padding: 10,
//     marginHorizontal: 0,
//   },
//   sectionTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 6,
//     marginTop: 10,
//   },


// tabContainer: {
//   flexDirection: 'row',
//   flexWrap: 'wrap',
//   justifyContent: 'space-around',
//   marginBottom: 20,
// },
// tabButton: {
//   paddingVertical: 10,
//   paddingHorizontal: 15,
//   borderRadius: 8,
//   borderWidth: 1,
//   borderColor: '#7b7b7b',
//   backgroundColor: 'transparent',
//   margin: 4,
// },
// activeTabButton: {
//   backgroundColor: '#000',
//   borderColor: '#000',

// },
// tabText: {
//   color: '#7b7b7b',
//   fontWeight: '500',
// },
// activeTabText: {
//   color: '#fff',
// },



//   submitButton: {
//     backgroundColor: '#000',
//     paddingVertical: 15,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   submitText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   optionRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 2,
//   },
  
//   optionButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     marginRight: 8,
//     marginBottom: 2,
//   },
  
//   optionText: {
//     fontWeight: '500',
//     color: '#333',
//   },
  
//   optionSelected: {
//     backgroundColor: '#000',
//     borderColor: '#000',
//   },
  
//   optionSelectedText: {
//     color: '#fff',
//   },
  
// });



/* 
 - Everythin above is from the initial CreateSpaceScreen. 
*/



import React from 'react';
import SpaceForm from './SpaceForm';
import { addDoc, Timestamp, collection } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function CreateSpaceScreen() {
  const handleCreate = async (data: any) => {
    await addDoc(collection(db, 'spaces'), {
      ...data,
      createdAt: Timestamp.now(),
    });
    alert('Post created successfully!');
  };

  return <SpaceForm mode="create" onSubmit={handleCreate} />;
}


