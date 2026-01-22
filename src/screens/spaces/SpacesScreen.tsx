
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
import { COLORS, FONT_SIZES, SPACING, COMMON_STYLES } from '../Styles/theme';
import { doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Import PROVIDER_GOOGLE, Circle from react-native-maps
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SpaceCard from '../../components/SpaceCard'; // ✅ Reusable component
import { FilterData, useFilterContext } from '../../context/FilterContext';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');

// Save / unsave icons
const saveIcons = {
  saved: require('assets/filter/bookmark.png'),
  unsaved: require('assets/filter/bookmark-outline.png'),
};

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
  totalFilters: number | undefined;
  matchScore?: number;  
  blockedTimes: any;
  id: string;
  accessibility?: string;
  address?: string;
  isPublic?: boolean; 
  availability?: {
    startDate?: string;
    endDate?: string;
  };
  billingFrequency?: string;
  contracts?: {
    [userId: string]: {
      startDate?: any; 
      endDate?: any;
      requestedAt?: any;
      state?: string;
    };
  };
  createdAt?: any; 
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
  usageType?: string[];
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
  const [savedSpaces, setSavedSpaces] = useState<{ [spaceId: string]: boolean }>({});
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  
  
  const toggleView = useCallback(() => setIsMapView(prev => !prev), []);

  // --- Image Handling for Map Markers ---


  const getPinBackground = useCallback((postType?: 'Offering' | 'Requesting') => {
    return postType === 'Requesting'
      ? require('../../../assets/pins/yellowPin.png')
      : require('../../../assets/pins/greenPin.png');
  }, []);

  const displayedSpaces = showSavedOnly
  ? spaces.filter(space => savedSpaces[space.id])
  : spaces;


  useEffect(() => {
    if (!userId) return;
    const loadSaved = async () => {
      try {
        const snapshot = await getDocs(collection(db, `users/${userId}/SavedReservations`));
        const saved: { [spaceId: string]: boolean } = {};
        snapshot.forEach(doc => {
          saved[doc.id] = true; // presence = saved
        });
        setSavedSpaces(saved);
      } catch (error) {
        console.error('Error loading saved spaces:', error);
      }
    };
  
    loadSaved();
  }, [userId]);

  const toggleSave = async (spaceId: string) => {
    if (!userId) return;
  
    const docRef = doc(db, `users/${userId}/SavedReservations`, spaceId);
    const isCurrentlySaved = savedSpaces[spaceId];
  
    try {
      if (isCurrentlySaved) {
        // Unsave
        await deleteDoc(docRef);
        setSavedSpaces(prev => ({ ...prev, [spaceId]: false }));
      } else {
        // Save
        await setDoc(docRef, {
          reservationId: spaceId,
          savedAt: Timestamp.now(),
        });
        setSavedSpaces(prev => ({ ...prev, [spaceId]: true }));
      }
    } catch (error) {
      console.error('Error toggling saved space:', error);
    }
  };
  


  const datesOverlap = (
    userStart: string,
    userEnd: string,
    blockedStart: string,
    blockedEnd: string
  ) => {
    const uStart = new Date(userStart);
    const uEnd = new Date(userEnd);
    const bStart = new Date(blockedStart);
    const bEnd = new Date(blockedEnd);
  
    // Overlap condition
    return bStart <= uEnd && bEnd >= uStart;
  };
  



  const computeMatchScore = (space: Space, filters: FilterData) => {
    let score = 0;
  
    // ---- USAGE TYPE (multiple) ----
    if (filters.usageType?.length && space.usageType?.length) {
      const matches = space.usageType.filter(t => filters.usageType!.includes(t));
      score += matches.length;   // add # of matches
    }
  
    // ---- SECURITY FEATURES (multiple) ----
    if (filters.securityFeatures?.length && space.security?.length) {
      const matches = space.security.filter(s => filters.securityFeatures!.includes(s));
      score += matches.length;   // add # of matches
    }
  
// ---- ACCESSIBILITY (single) ----
if (filters.accessibility?.length && space.accessibility?.length) {
  const hasMatch = filters.accessibility.some(a => space.accessibility!.includes(a));
  if (hasMatch) score += 1;
}

  
    // ---- STORAGE TYPE (single) ----
    if (filters.storageType && space.storageType) {
      if (filters.storageType === space.storageType) {
        score += 1;
      }
    }
  
    console.log('SCORE:', score);
    return score;
  };
  
  
  

  const { filters } = useFilterContext(); 


  const fetchAndFilterSpaces = useCallback(async () => {
    console.log('Filters from context:', filters);

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
      allSpaces = allSpaces.filter(space => space.isPublic !== false); 


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

        if (filters.startDate && filters.endDate) {
          filtered = filtered.filter(space => {
            console.log("THE BLOCKED TIMES SET IN FILTERS" + space.blockedTimes)

            // No blockedTimes means fully available
            if (!space.blockedTimes || space.blockedTimes.length === 0) {
              return true;
            }

            // Check for overlap with any blocked entry
            const hasOverlap = space.blockedTimes.some((block: { start: string; end: string; }) =>
              datesOverlap(
                filters.startDate!,
                filters.endDate!,
                block.start,
                block.end
              )
            );

            return !hasOverlap; // keep only spaces without overlap
          });
        }

        filtered = filtered.map(space => {
          const matchScore = computeMatchScore(space, filters);

          const totalFilters =
            (filters.usageType?.length ?? 0) +
            (filters.securityFeatures?.length ?? 0) +
            (filters.accessibility?.length ?? 0) +
            (filters.storageType ? 1 : 0);

          return { ...space, matchScore, totalFilters };
        });

        // Tell TS these fields now exist
        type ScoredSpace = Space & {
          matchScore: number;
          totalFilters: number;
        };

        const scored = filtered as ScoredSpace[];

        // Sort
        scored.sort((a, b) => {
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          return b.totalFilters - a.totalFilters;
        });

        // Set spaces
        setSpaces(scored);

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

        <View style={styles.savedAndFilter}>
          <TouchableOpacity
            onPress={() => setShowSavedOnly(prev => !prev)}
            style={{
              marginRight: 10,
              backgroundColor: showSavedOnly ? '#E0FFE0' : 'transparent',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <Image
              source={showSavedOnly ? saveIcons.saved : saveIcons.unsaved}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Filters', { currentFilters: route.params?.filters })}>
            <Ionicons name="filter" size={30} color="#333" />
          </TouchableOpacity>
        </View>



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

            {displayedSpaces
              .filter((space): space is Space & { location: { lat: number; lng: number } } =>
                !!space.location?.lat && !!space.location?.lng
              )
              .map(space => {
                const pinBackground = getPinBackground(space.postType);

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
                  <Image source={getPinBackground(space.postType)} style={styles.pinBackground} />
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



              <SpaceCard
                item={selectedSpace}
                matchScore={selectedSpace?.matchScore}
                totalFilters={selectedSpace?.totalFilters}
                isSaved={!!savedSpaces[selectedSpace.id]}
                onToggleSave={() => toggleSave(selectedSpace.id)}
                onPress={() => navigation.navigate('SpaceDetail', { spaceId: selectedSpace.id })}
              />



            </TouchableOpacity>
          )}
        </>
      ) : (
        // List View
        <FlatList
          data={displayedSpaces}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (

            <SpaceCard
              item={item}
              matchScore={item.matchScore}
              totalFilters={item.totalFilters}
              isSaved={!!savedSpaces[item.id]}
              onToggleSave={() => toggleSave(item.id)}
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 16,
    backgroundColor: COLORS.lighterGrey,
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
  savedAndFilter: {
    display: 'flex',
    flexDirection: 'row'
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
