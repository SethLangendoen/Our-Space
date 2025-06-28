import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Circle } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Image } from 'react-native'; // Make sure Image is imported
const { width } = Dimensions.get('window');

/* some notes: 
- once posts are in place, we can dynamically add markers. 

*/ 



// Step 1: Define your navigation stack params
type RootStackParamList = {
  Spaces: undefined;
  Filters: undefined;
  SpaceDetail: { spaceId: string };

};

// Step 2: Type the navigation prop for this screen
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Spaces'>;

export default function SpacesScreen() {
  const [isMapView, setIsMapView] = useState(false);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any | null>(null);

  // Step 3: Use the typed navigation
  const navigation = useNavigation<NavigationProp>();

  const toggleView = () => setIsMapView(prev => !prev);


  const radiusCenter = { latitude: 43.6532, longitude: -79.3832 }; // Example: Toronto
const radiusInMeters = 3000; // 3 km radius

const fetchAllSpaces = async () => {
  setLoading(true);
  try {
    const querySnapshot = await getDocs(collection(db, 'spaces'));
    const allSpaces = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSpaces(allSpaces);
  } catch (error) {
    console.error('Error fetching spaces:', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchAllSpaces();
}, []);

useFocusEffect(
  useCallback(() => {
    fetchAllSpaces();
  }, [])
);


  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
          <Ionicons name={isMapView ? 'list' : 'map'} size={20} color="#333" />
          <Text style={styles.toggleText}>{isMapView ? 'List' : 'Map'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Filters')}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isMapView ? (

<>
          <MapView style={styles.mapView}>

            {spaces
              .filter(space => space.location?.lat && space.location?.lng)
              .map(space => (
                <Marker
                  key={space.id}
                  coordinate={{ latitude: space.location.lat, longitude: space.location.lng }}
                  title={space.title}
                  description={space.description}
                  onPress={() => setSelectedSpace(space)}
                />
              ))}
          </MapView>

          {/* Bottom panel showing selected space */}


          {selectedSpace && (


<TouchableOpacity
  style={styles.bottomPanel}
  activeOpacity={0.9}
  onPress={() => {
    navigation.navigate('SpaceDetail', { spaceId: selectedSpace.id });
    setSelectedSpace(null); // Optional: clear selection after navigating
  }}
>
  <TouchableOpacity onPress={() => setSelectedSpace(null)} style={styles.closeButton}>
    <Ionicons name="close" size={24} color="#333" />
  </TouchableOpacity>

  {selectedSpace.mainImage && (
    <Image source={{ uri: selectedSpace.mainImage }} style={styles.mainImage} resizeMode="cover" />
  )}

  <View style={styles.titleRow}>
    <Text style={styles.title}>{selectedSpace.title || 'No Title'}</Text>
    {selectedSpace.postType && (
      <View
        style={[
          styles.tag,
          selectedSpace.postType === 'Offering' ? styles.offeringTag : styles.requestingTag,
        ]}
      >
        <Text style={styles.tagText}>{selectedSpace.postType}</Text>
      </View>
    )}
  </View>

  {selectedSpace.description && (
    <Text style={styles.description}>{selectedSpace.description}</Text>
  )}

  {selectedSpace.price && (
    <Text style={styles.price}>${parseFloat(selectedSpace.price).toFixed(2)}</Text>
  )}
</TouchableOpacity>



          )}
        </>
      




      ) : (
        
<FlatList
  data={spaces}
  keyExtractor={item => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SpaceDetail', { spaceId: item.id })}
    >
      {/* Main Image */}
      {item.mainImage && (
        <Image
          source={{ uri: item.mainImage }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      )}

      {/* Title and Tag Row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{item.title || 'No Title'}</Text>
        {item.postType && (
          <View
            style={[
              styles.tag,
              item.postType === 'Offering' ? styles.offeringTag : styles.requestingTag,
            ]}
          >
            <Text style={styles.tagText}>{item.postType}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      {item.description && <Text style={styles.description}>{item.description}</Text>}

      {/* Cost */}
      {item.price && (
        <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
      )}
    </TouchableOpacity>
  )}
  ListEmptyComponent={() => (
    <View style={{ padding: 20 }}>
      <Text>No spaces found.</Text>
    </View>
  )}
/>


      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eef',
    padding: 8,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 16,
  },
  card: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  mapView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // New styles for list post item
  mainImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    flexShrink: 1,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  offeringTag: {
    backgroundColor: '#4CAF50', // green for Offering
  },
  requestingTag: {
    backgroundColor: '#F44336', // red for Requesting
  },
  tagText: {
    color: '#fff',
    fontWeight: '600',
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    color: '#555',
  },
  price: {
    marginTop: 6,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: { position: 'absolute', right: 12, top: 12, zIndex: 10 },

});


