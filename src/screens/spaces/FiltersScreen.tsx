


import React, { useState, useCallback, useEffect } from 'react'; // Added useCallback
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
  Alert, // Added for location permission feedback
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Calendar } from 'react-native-calendars';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'; // Import useNavigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import NativeStackNavigationProp
import { useFilterContext } from '../../context/FilterContext';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { COLORS } from '../Styles/theme';

type FiltersObjectType = {
  categories?: string[];
  maxPrice?: string;
  startDate?: string;
  endDate?: string;
  radius?: number;
  // pickupDropoff?: boolean;
  storageType?: 'Indoor' | 'Outdoor' | 'Climate-Controlled';

  location?: { lat: number; lng: number };
  address?: string;
  usageType?: string[];                // e.g. "Short-term" | "Long-term"
  securityFeatures?: string[];       // multiple checkboxes/toggles
  accessibility?: string[];          // e.g. ["24/7 Access", "Wheelchair"]
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

// Define the navigation prop for THIS screen
type FiltersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Filters'>;

const categories = [
  { id: '1', label: 'Personal', image: require('../../../assets/filter/personal.jpeg') },
  { id: '2', label: 'Business', image: require('../../../assets/filter/business.jpeg') },
  { id: '3', label: 'Boat', image: require('../../../assets/filter/boat.jpeg') },
  { id: '4', label: 'RV', image: require('../../../assets/filter/rv.jpeg') },
];











export default function FiltersScreen() {
  // FIX 2: Correctly initialize useNavigation and type it
  const navigation = useNavigation<FiltersScreenNavigationProp>();
  const { filters, setFilters } = useFilterContext(); // ✅ Access context

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [radius, setRadius] = useState(10);
  const [maxPrice, setMaxPrice] = useState('');
  // const [pickupDropoff, setPickupDropoff] = useState(false);
  const [storageType, setStorageType] = useState<'Indoor' | 'Outdoor' | 'Climate-Controlled' | undefined>(undefined);

  const storageTypeOptions: ('Indoor' | 'Outdoor' | 'Climate-Controlled')[] = [
    'Indoor',
    'Outdoor',
    'Climate-Controlled',
  ];

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>(''); // Added state for address input


  const [usageType, setUsageType] = useState<string[]>([]);
  const [securityFeatures, setSecurityFeatures] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState<string[]>([]);

  const [locationMode, setLocationMode] = useState<'current' | 'manual'>('manual');

  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;

    
  const toggleUsageType = (type: string) => {
    setUsageType((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const toggleSecurity = (type: string) => {
    setSecurityFeatures((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const toggleAccessibility = (type: string) => {
    setAccessibility(prev => (prev.includes(type) ? [] : [type]));
  };

  // Usage Type options
  const usageTypeOptions = ['Cars/Trucks', 'RV', 'Boats', 'Personal', 'Business'];

  // Security options
  const securityOptions = ['Video Surveillance', 'Pinpad/Keys', 'Gated Area', 'Smoke Detectors'];

  // Accessibility options
  const accessibilityOptions = ['1 day notice', '2+ days notice', '24/7'];



// everything to do with the filter reset and apply functionality. 
  const [initialFilters, setInitialFilters] = useState<FiltersObjectType | null>(null);
  useEffect(() => {
    if (filters) {
      setInitialFilters(filters);
      setSelectedCategories(filters.categories || []);
      setMaxPrice(filters.maxPrice || '');
      setStartDate(filters.startDate || '');
      setEndDate(filters.endDate || '');
      setRadius(filters.radius ?? 10);
      // setPickupDropoff(filters.pickupDropoff ?? false);
      setSelectedLocation(filters.location ?? null);
      setLocationAddress(filters.address || '');
      setUsageType(filters.usageType || []);
      setSecurityFeatures(filters.securityFeatures || []);
      setAccessibility(filters.accessibility || []);
      setStorageType(filters.storageType || undefined);

    }
  }, []);
  

  const currentFilters: FiltersObjectType = {
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    maxPrice: maxPrice || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    radius,
    // pickupDropoff: pickupDropoff || undefined,
    location: selectedLocation || undefined,
    address: locationAddress || undefined,
    usageType: usageType || undefined,
    securityFeatures: securityFeatures.length > 0 ? securityFeatures : undefined,
    accessibility: accessibility.length > 0 ? accessibility : undefined,
    storageType: storageType || undefined,

  };
  

  const filtersApplied = Object.values(currentFilters).some(val => val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0));
  const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(initialFilters || {});

















  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  const resetFilters = () => {
    setSelectedCategories([]);
    setStartDate('');
    setEndDate('');
    setRadius(10);
    setMaxPrice(''); // Reset maxPrice
    // setPickupDropoff(false);
    setSelectedLocation(null); // Reset location
    setLocationAddress(''); // Reset address
    setUsageType([]); // Reset Usage Type
    setSecurityFeatures([]); // Reset Security Features
    setAccessibility([]); // Reset Accessibility
    setStorageType(undefined);

  };
  



  const handleApplyFilters = async () => {
    let locationCoords = selectedLocation;
  
    // If user typed an address but didn't use current location
    if (!locationCoords && locationAddress) {
      try {
        const geocoded = await Location.geocodeAsync(locationAddress);
        if (geocoded.length > 0) {
          locationCoords = {
            lat: geocoded[0].latitude,
            lng: geocoded[0].longitude,
          };
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        Alert.alert('Location Error', 'Could not find coordinates for that address.');
      }
    }
  
    const newFilters = {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      maxPrice: maxPrice || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      radius,
      // pickupDropoff: pickupDropoff || undefined,
      location: locationCoords || undefined, // Now will have lat/lng
      address: locationAddress || undefined,
      usageType: usageType.length > 0 ? usageType : undefined,
      securityFeatures: securityFeatures.length > 0 ? securityFeatures : undefined,
      accessibility: accessibility.length > 0 ? accessibility : undefined,
      storageType: storageType || undefined,

    };
  
    setFilters(newFilters);
    navigation.navigate('SpacesMain');
  };
  
  


  return (

<View style={{ flex: 1 }}>


{/* <ScrollView
  contentContainerStyle={styles.scrollContainer}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
  nestedScrollEnabled={true} // <-- this allows inner scrolling
> */}

<KeyboardAwareScrollView
  contentContainerStyle={styles.scrollContainer}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>

  <Text style={styles.sectionTitle}>Location</Text>

<View style={styles.card}>
  <View style={styles.toggleRow}>
    <TouchableOpacity
      onPress={() => setLocationMode('current')}
      style={[
        styles.optionButton,
        locationMode === 'current' && styles.optionButtonSelected,
      ]}
    >
      <Text
        style={[
          styles.optionText,
          locationMode === 'current' && styles.optionTextSelected,
        ]}
      >
        Use Current
      </Text>
    </TouchableOpacity>



    <TouchableOpacity
      onPress={() => setLocationMode('manual')}
      style={[
        styles.optionButton,
        locationMode === 'manual' && styles.optionButtonSelected,
      ]}
    >
      <Text
        style={[
          styles.optionText,
          locationMode === 'manual' && styles.optionTextSelected,
        ]}
      >
        Enter Address
      </Text>
    </TouchableOpacity>



  </View>


{locationMode === 'current' ? (
  <TouchableOpacity
    style={styles.locationButton}
    onPress={async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setSelectedLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      setLocationAddress('Current Location');
      Alert.alert('Location Set', 'Your current location has been captured.');
    }}
  >
    <Text style={styles.locationButtonText}>
      {selectedLocation ? 'Current Location Set ✓' : 'Use Current Location'}
    </Text>
  </TouchableOpacity>
) : (
<View style={{ maxHeight: 250, zIndex: 1000 }}>


<GooglePlacesAutocomplete
  placeholder="Start typing address or city..."
  fetchDetails={true}
  onPress={(data, details = null) => {
    if (!details) return;
    setLocationAddress(data.description);
    setSelectedLocation({
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
    });
  }}
  query={{
    key: GOOGLE_MAPS_API_KEY,
    language: 'en',
    components: 'country:ca|country:us',
  }}
  styles={{
    container: { flex: 0 },
    textInput: styles.textInput,
    listView: [styles.autocompleteList, { scrollEnabled: false }], // Extra safety
  }}
  enablePoweredByContainer={false}
  textInputProps={{
    value: locationAddress,
    onChangeText: setLocationAddress,
  }}
  disableScroll={true} // The main fix for the VirtualizedList error
/>

  </View>
)}








<Text style={styles.sectionTitle}>Search Radius: {radius} km</Text>
  <Slider
    minimumValue={1}
    maximumValue={100}
    step={1}
    value={radius}
    onValueChange={(value) => setRadius(value)}
    minimumTrackTintColor="#0F6B5B"
    maximumTrackTintColor="#A0A0A0"
    thumbTintColor="#0F6B5B"
    style={{ width: '100%', marginBottom: 16 }}
  />


</View>

 {/* Calendar
 <Text style={styles.sectionTitle}>Select Storage Dates</Text>
  <View style={styles.card}>
    <Calendar
      onDayPress={(day) => {
        if (!startDate || (startDate && endDate)) {
          setStartDate(day.dateString);
          setEndDate('');
        } else {
          if (day.dateString >= startDate) {
            setEndDate(day.dateString);
          } else {
            setStartDate(day.dateString);
            setEndDate('');
            Alert.alert('Invalid Date', 'End date cannot be before start date.');
          }
        }
      }}
      markedDates={{
        ...(startDate
          ? {
              [startDate]: {
                selected: true,
                startingDay: true,
                color: '#0F6B5B',
                textColor: 'white',
              },
            }
          : {}),
        ...(endDate
          ? {
              [endDate]: {
                selected: true,
                endingDay: true,
                color: '#0F6B5B',
                textColor: 'white',
              },
            }
          : {}),
        ...(startDate && endDate
          ? (() => {
              const dates: { [key: string]: any } = {};
              let currentDate = new Date(startDate);
              let lastDate = new Date(endDate);
              while (currentDate <= lastDate) {
                const dateString = currentDate.toISOString().split('T')[0];
                if (dateString !== startDate && dateString !== endDate) {
                  dates[dateString] = { color: '#629447', textColor: 'white' };
                }
                currentDate.setDate(currentDate.getDate() + 1);
              }
              return dates;
            })()
          : {}),
      }}
      markingType={'period'}
    />
  </View> */}


  {/* Usage Type */}
  <Text style={styles.sectionTitle}>Usage Type</Text>
  <View style={styles.cardRowWrap}>
    {usageTypeOptions.map((type) => {
      const selected = usageType.includes(type);
      return (
        <TouchableOpacity
          key={type}
          onPress={() => toggleUsageType(type)}
          style={[styles.optionButton, selected && styles.optionButtonSelected]}
        >
          <Text
            style={[styles.optionText, selected && styles.optionTextSelected]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>

  {/* Security Features */}
  <Text style={styles.sectionTitle}>Security Features</Text>
  <View style={styles.cardRowWrap}>
    {securityOptions.map((type) => {
      const selected = securityFeatures.includes(type);
      return (
        <TouchableOpacity
          key={type}
          onPress={() => toggleSecurity(type)}
          style={[styles.optionButton, selected && styles.optionButtonSelected]}
        >
          <Text
            style={[styles.optionText, selected && styles.optionTextSelected]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>

  {/* Accessibility */}
  <Text style={styles.sectionTitle}>Accessibility</Text>
  <View style={styles.cardRowWrap}>
    {accessibilityOptions.map((type) => {
      const selected = accessibility.includes(type);
      return (
        <TouchableOpacity
          key={type}
          onPress={() => toggleAccessibility(type)}
          style={[styles.optionButton, selected && styles.optionButtonSelected]}
        >
          <Text
            style={[styles.optionText, selected && styles.optionTextSelected]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>

  {/* Storage Type */}
  <Text style={styles.sectionTitle}>Storage Type</Text>
  <View style={styles.cardRow}>
    {storageTypeOptions.map((type) => (
      <TouchableOpacity
        key={type}
        onPress={() => setStorageType(type)}
        style={[
          styles.optionButton,
          storageType === type && styles.optionButtonSelected,
        ]}
      >
        <Text
          style={[
            styles.optionText,
            storageType === type && styles.optionTextSelected,
          ]}
        >
          {type}
        </Text>
      </TouchableOpacity>
    ))}
  </View>

</KeyboardAwareScrollView>













  {/* Sticky footer */}
  <View style={styles.footer}>
    <TouchableOpacity
      style={[
        styles.applyButton,
        styles.secondaryButton,
        !filtersApplied && styles.disabledButton,
      ]}
      onPress={resetFilters}
      disabled={!filtersApplied}
    >
      <Text
        style={[
          styles.buttonText,
          styles.secondaryButtonText,
          !filtersApplied && styles.disabledText,
        ]}
      >
        Reset Filters
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[
        styles.applyButton,
        !filtersChanged && styles.disabledButton,
      ]}
      onPress={handleApplyFilters}
      disabled={!filtersChanged}
    >
      <Text
        style={[
          styles.buttonText,
          !filtersChanged && styles.disabledText,
        ]}
      >
        Apply
      </Text>
    </TouchableOpacity>
  </View>


  </View>



  );


}




const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 48,
    backgroundColor: COLORS.lighterGrey,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#0F6B5B', // Emerald Green
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#0F6B5B',
    borderColor: '#0F6B5B',
  },
  optionText: {
    fontFamily: 'Poppins-Regular',
    color: '#1F1F1F',
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  locationButton: {
    padding: 12,
    backgroundColor: '#E6F0FF',
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  locationButtonText: {
    fontFamily: 'Poppins-Bold',
    color: '#0F6B5B',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  applyButton: {
    flex: 1,
    marginLeft: 10,
    padding: 14,
    backgroundColor: '#0F6B5B',
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0F6B5B',
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Poppins-Bold',
  },
  secondaryButtonText: {
    color: '#0F6B5B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  
  disabledButton: {
    backgroundColor: '#ccc',
  },
  
  disabledText: {
    color: '#777',
  },
  autocompleteList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200
  },
  
});
