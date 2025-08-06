



import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image, // Import Image for custom markers
  ActivityIndicator, // Added for loading state
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Import PROVIDER_GOOGLE, Circle from react-native-maps
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SpaceCard from '../../components/SpaceCard'; // ✅ Reusable component
import * as Location from 'expo-location'; // Also needed here for distance
import { useFilterContext } from '../../context/FilterContext';

const { width } = Dimensions.get('window');

// --- Type Definitions ---
// Define the RootStackParamList for consistent navigation types
// type RootStackParamList = {
//   Spaces: {
//     filters?: {
//       categories?: string[];
//       maxPrice?: string;
//       startDate?: string;
//       endDate?: string;
//       radius?: number;
//       pickupDropoff?: boolean;
//       postType?: 'Offering' | 'Requesting' | 'Both';
//       location?: { lat: number; lng: number }; // Keep location optional here
//       address?: string;
//     };
//   } | undefined; // 'Spaces' can also be navigated to without params
//   Filters: undefined;
//   SpaceDetail: { spaceId: string };
// };

type RootStackParamList = {
  SpacesMain: {
    filters?: FiltersObjectType;
  } | undefined;
  Filters: {
    currentFilters?: FiltersObjectType;
  } | undefined;
  SpaceDetail: { spaceId: string };
};

type FiltersObjectType = {
  categories?: string[];
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
  radius?: number;
  pickupDropoff?: boolean;
  postType?: 'Offering' | 'Requesting' | 'Both';
  location?: { lat: number; lng: number };
  address?: string;
};





// Define the navigation prop for this screen
type SpacesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SpacesMain'>;

// Define the route prop for this screen specifically
type SpacesScreenRouteProp = RouteProp<RootStackParamList, 'SpacesMain'>;

// Define the Space type for better data structure clarity
type Space = {
  id: string;
  accessibility?: string;
  address?: string;
  availability?: {
    startDate?: string;
    endDate?: string;
  };
  billingFrequency?: string;
  contracts?: {
    [userId: string]: {
      startDate?: any; // Could use Firebase Timestamp or Date
      endDate?: any;
      requestedAt?: any;
      state?: string;
    };
  };
  createdAt?: any; // Firebase Timestamp
  deliveryMethod?: string[];
  description?: string;
  dimensions?: {
    height?: string;
    length?: string;
    width?: string;
  };
  images?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  mainImage?: string;
  postType?: 'Offering' | 'Requesting';
  price?: string;
  security?: string[];
  storageType?: string;
  title?: string;
  usageType?: string;
  userId?: string;
};

// --- Helper Function for Distance Calculation ---
const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number): number => (value * Math.PI) / 180;
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- Main SpacesScreen Component ---
export default function SpacesScreen() {
  const [isMapView, setIsMapView] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true); // Set to true initially for first load
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null); // Type for selectedSpace
  const navigation = useNavigation<SpacesScreenNavigationProp>();
  const route = useRoute<SpacesScreenRouteProp>(); // Correctly type the useRoute hook
  const [searchInfo, setSearchInfo] = useState<{ address: string; radius: number; location: { lat: number; lng: number } } | null>(null); // **Updated searchInfo type**

  
  const toggleView = useCallback(() => setIsMapView(prev => !prev), []);

  // --- Image Handling for Map Markers ---
  const getUsageIcon = useCallback((usageType?: string) => {
    switch (usageType?.toLowerCase()) {
      case 'cars/trucks':
        return require('../../../assets/pins/car.png');
      case 'rv':
        return require('../../../assets/pins/rv.png');
      case 'boats':
        return require('../../../assets/pins/boat.png');
      case 'personal':
        return require('../../../assets/pins/personal.png');
      case 'business':
        return require('../../../assets/pins/business.png');
      default:
        return null;
    }
  }, []);

  const getPinBackground = useCallback((postType?: 'Offering' | 'Requesting') => {
    return postType === 'Requesting'
      ? require('../../../assets/pins/redPin.png')
      : require('../../../assets/pins/greenPin.png');
  }, []);



  const { filters } = useFilterContext(); // ✅


  const fetchAndFilterSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'spaces'));
      let allSpaces: Space[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Space, 'id'>;
        return {
          id: doc.id,
          ...data,
        };
      });

      if (filters) {
        let filtered = [...allSpaces];

        if (filters.postType && filters.postType !== 'Both') {
          filtered = filtered.filter(space => space.postType === filters.postType);
        }

        if (filters.location && filters.radius) {
          const { lat, lng } = filters.location;
          const radius = filters.radius;
          filtered = filtered.filter(space => {
            if (!space.location) return false;
            const distance = getDistanceFromLatLonInKm(
              lat, lng, space.location.lat, space.location.lng
            );
            return distance <= radius;
          });

          setSearchInfo({
            address: filters.address || 'Unknown Address',
            radius: filters.radius,
            location: filters.location,
          });
        } else {
          setSearchInfo(null);
        }

        setSpaces(filtered);
      } else {
        setSpaces(allSpaces);
        setSearchInfo(null);
      }
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  }, [filters]); // ✅ depends on context filters now

  // // --- Data Fetching Logic ---
  // const fetchAndFilterSpaces = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const querySnapshot = await getDocs(collection(db, 'spaces'));
  //     let allSpaces: Space[] = querySnapshot.docs.map(doc => {
  //       const data = doc.data() as Omit<Space, 'id'>;
  //       return {
  //         id: doc.id,
  //         ...data,
  //       };
  //     });

  //     const filters = route.params?.filters;

  //     if (filters) {
  //       let filtered = [...allSpaces];

  //       // Filter by postType
  //       if (filters.postType && filters.postType !== 'Both') {
  //         filtered = filtered.filter((space) => space.postType === filters.postType);
  //       }

  //       if (filters.location && filters.radius) {
  //         const { lat, lng } = filters.location;
  //         const radius = filters.radius;
                  
  //         filtered = filtered.filter((space): space is Space & { location: { lat: number; lng: number } } => {
  //           if (!space.location || typeof space.location.lat !== 'number' || typeof space.location.lng !== 'number') {
  //             return false;
  //           }
  //           const distance = getDistanceFromLatLonInKm(
  //             lat, // ✅ No TS error now
  //             lng,
  //             space.location.lat,
  //             space.location.lng
  //           );
  //           return distance <= radius;
  //         });
        
  //         setSearchInfo({
  //           address: filters.address || 'Unknown Address',
  //           radius: filters.radius,
  //           location: filters.location, // Already valid
  //         });
  //       } else {
  //         setSearchInfo(null);
  //       }
        





  //       setSpaces(filtered);
  //     } else {
  //       setSpaces(allSpaces);
  //       setSearchInfo(null);
  //     }



  //   } catch (error) {
  //     console.error('Error fetching and filtering spaces:', error);
  //     setSpaces([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [route.params?.filters, getPinBackground, getUsageIcon]);





  // Fetch spaces on initial mount and when filters change

  useFocusEffect(
    useCallback(() => {
      fetchAndFilterSpaces();
    }, [fetchAndFilterSpaces])
  );
  
  // --- Render ---
  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
          <Ionicons name={isMapView ? 'list' : 'map'} size={20} color="#333" />
          <Text style={styles.toggleText}>{isMapView ? 'List' : 'Map'}</Text>
        </TouchableOpacity>

        {searchInfo && (
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 12, color: '#333' }} numberOfLines={1}>
              📍 {searchInfo.address}
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>
              Radius: {searchInfo.radius} km
            </Text>
          </View>
        )}

        {/* <TouchableOpacity onPress={() => navigation.navigate('Filters')}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity> */}

        <TouchableOpacity onPress={() => navigation.navigate('Filters', { currentFilters: route.params?.filters })}>
          <Ionicons name="filter" size={24} color="#333" />
        </TouchableOpacity>




      </View>




      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" /> 
          <Text>Loading spaces...</Text>
        </View>
      ) : isMapView ? (
        // Map View
        <>
          <MapView
            style={styles.mapView}
            provider={PROVIDER_GOOGLE}
            initialRegion={
              searchInfo?.location
                ? {
                    latitude: searchInfo.location.lat,
                    longitude: searchInfo.location.lng,
                    latitudeDelta: searchInfo.radius * 0.02, 
                    longitudeDelta: searchInfo.radius * 0.02,
                  }
                : spaces.length > 0 && spaces[0].location
                ? {
                    latitude: spaces[0].location.lat,
                    longitude: spaces[0].location.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }
                : { 
                    latitude: 34.0522, 
                    longitude: -118.2437,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }
            }
          >
            {searchInfo?.location && (
              <>
                  <Marker
                    coordinate={{
                      latitude: searchInfo.location.lat,
                      longitude: searchInfo.location.lng,
                    }}
                    title="Search Origin"
                    description={searchInfo.address}
                    pinColor="blue"
                  />

                  <Circle
                    center={{
                      latitude: searchInfo.location.lat,
                      longitude: searchInfo.location.lng,
                    }}
                    radius={searchInfo.radius * 1000}
                    strokeWidth={2}
                    strokeColor="rgba(0, 112, 255, 0.5)"
                    fillColor="rgba(0, 112, 255, 0.1)"
                  />

              </>
            )}

            {spaces
              .filter((space): space is Space & { location: { lat: number; lng: number } } =>
                !!space.location?.lat && !!space.location?.lng
              )
              .map(space => {
                const pinBackground = getPinBackground(space.postType);
                const icon = getUsageIcon(space.usageType);

                return (
                  <Marker
                    key={space.id}
                    coordinate={{
                      latitude: space.location.lat, 
                      longitude: space.location.lng, 
                    }}
                    title={space.title}
                    onPress={() => setSelectedSpace(space)}
                  >
                    <View style={styles.customMarkerContainer}>
                      <Image source={pinBackground} style={styles.pinBackground} />
                      {icon && (
                        <Image
                          source={icon}
                          style={styles.pinIcon}
                        />
                      )}
                    </View>
                  </Marker>
                );
              })}
          </MapView>

          {/* Bottom Panel Card when Marker is selected */}
          {selectedSpace && (
            <TouchableOpacity
              style={styles.bottomPanel}
              activeOpacity={0.9}
              onPress={() => {
                navigation.navigate('SpaceDetail', { spaceId: selectedSpace.id });
                setSelectedSpace(null); // Clear selected space after navigation
              }}
            >
              <TouchableOpacity
                onPress={() => setSelectedSpace(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>

              {/* Reuse SpaceCard layout here */}
              <SpaceCard
                item={selectedSpace}
                onPress={() => navigation.navigate('SpaceDetail', { spaceId: selectedSpace.id })}
              />
            </TouchableOpacity>
          )}
        </>
      ) : (
        // List View
        <FlatList
          data={spaces}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SpaceCard
              item={item}
              onPress={() => navigation.navigate('SpaceDetail', { spaceId: item.id })}
            />
          )}
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text>No spaces found matching your criteria.</Text>
            </View>
          )}
          contentContainerStyle={spaces.length === 0 && { flexGrow: 1, justifyContent: 'center' }}
        />
      )}
    </View>
  );
}

// // --- Styles ---
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 15,
//     paddingHorizontal: 16,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   toggleButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: '#eef',
//     padding: 8,
//     borderRadius: 6,
//   },
//   toggleText: {
//     fontSize: 16,
//   },
//   mapView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   customMarkerContainer: {
//     alignItems: 'center',
//   },
//   pinBackground: {
//     width: 50,
//     height: 50,
//     resizeMode: 'contain', // Ensure the image scales properly
//   },
//   pinIcon: {
//     width: 24,
//     height: 24,
//     position: 'absolute',
//     top: 4,
//     resizeMode: 'contain', // Ensure the icon scales properly
//   },
//   bottomPanel: {
//     position: 'absolute',
//     bottom: 0,
//     width: width,
//     backgroundColor: '#f9f9f9',
//     padding: 20,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   closeButton: {
//     position: 'absolute',
//     right: 12,
//     top: 12,
//     zIndex: 10,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 16,
    backgroundColor: '#FFFCF1', // Wheat/Cream background
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
    backgroundColor: '#DFF5D1', // Light tint of earthy green
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  toggleText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#0F6B5B', // Emerald green
  },

  mapView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  customMarkerContainer: {
    alignItems: 'center',
  },

  pinBackground: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  pinIcon: {
    width: 24,
    height: 24,
    position: 'absolute',
    top: 4,
    resizeMode: 'contain',
  },

  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },

  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFCF1',
  },
});
