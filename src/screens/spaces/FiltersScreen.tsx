


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
import { Calendar } from 'react-native-calendars';
import Slider from '@react-native-community/slider';
import * as Location from 'expo-location';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'; // Import useNavigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import NativeStackNavigationProp
import { useFilterContext } from '../../context/FilterContext';



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
  const [pickupDropoff, setPickupDropoff] = useState(false);

  // This useState is already correctly typed as 'Offering' | 'Requesting' | 'Both'
  const [postType, setPostType] = useState<'Offering' | 'Requesting' | 'Both'>('Both');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>(''); // Added state for address input

  const postTypesOptions: ('Offering' | 'Requesting' | 'Both')[] = ['Offering', 'Requesting', 'Both'];


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
    setPickupDropoff(false);
    setPostType('Both'); // Reset postType
    setSelectedLocation(null); // Reset location
    setLocationAddress(''); // Reset address
  };

  const route = useRoute<RouteProp<RootStackParamList, 'Filters'>>();

  

  // useEffect(() => {
  //   const currentFilters = route.params?.currentFilters;
  
  //   if (currentFilters) {
  //     setSelectedCategories(currentFilters.categories || []);
  //     setMaxPrice(currentFilters.maxPrice || '');
  //     setStartDate(currentFilters.startDate || '');
  //     setEndDate(currentFilters.endDate || '');
  //     setRadius(currentFilters.radius ?? 10);
  //     setPickupDropoff(currentFilters.pickupDropoff ?? false);
  //     setPostType(currentFilters.postType ?? 'Both');
  //     setSelectedLocation(currentFilters.location ?? null);
  //     setLocationAddress(currentFilters.address || '');
  //   }
  // }, []);
  
  useEffect(() => {
    if (filters) {
      setSelectedCategories(filters.categories || []);
      setMaxPrice(filters.maxPrice || '');
      setStartDate(filters.startDate || '');
      setEndDate(filters.endDate || '');
      setRadius(filters.radius ?? 10);
      setPickupDropoff(filters.pickupDropoff ?? false);
      setPostType(filters.postType ?? 'Both');
      setSelectedLocation(filters.location ?? null);
      setLocationAddress(filters.address || '');
    }
  }, []);


  // Function to handle applying filters and navigating
  // const handleApplyFilters = useCallback(() => {
  //   // Construct the filters object based on current state
  //   const filters = {
  //     categories: selectedCategories.length > 0 ? selectedCategories : undefined,
  //     maxPrice: maxPrice || undefined, // Use undefined if empty string
  //     startDate: startDate || undefined,
  //     endDate: endDate || undefined,
  //     radius: radius, // Radius always has a number value, no need for || undefined
  //     pickupDropoff: pickupDropoff || undefined, // Only pass if true, otherwise undefined
  //     postType: postType === 'Both' ? undefined : postType, // Pass undefined if 'Both'
  //     location: selectedLocation || undefined, // Pass undefined if null
  //     address: locationAddress || undefined, // Pass undefined if empty string
  //   };

  //   // Determine the params to pass to Spaces screen.
  //   // If all filter values are undefined/empty, pass `undefined` as the params object
  //   // to match `RootStackParamList` for `Spaces`.
  //   const paramsToPass = Object.values(filters).some(value =>
  //     value !== undefined && value !== null && value !== '' &&
  //     !(Array.isArray(value) && value.length === 0) // Handle empty arrays
  //   ) ? { filters } : undefined;


  //   // FIX 2: navigation.navigate is now correctly accessed
  //   navigation.navigate('SpacesMain', paramsToPass);
  // }, [
  //   navigation,
  //   selectedCategories,
  //   maxPrice,
  //   startDate,
  //   endDate,
  //   radius,
  //   pickupDropoff,
  //   postType,
  //   selectedLocation,
  //   locationAddress, // Add locationAddress to dependencies
  // ]);

  const handleApplyFilters = () => {
    const newFilters = {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      maxPrice: maxPrice || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      radius,
      pickupDropoff: pickupDropoff || undefined,
      postType: postType === 'Both' ? undefined : postType,
      location: selectedLocation || undefined,
      address: locationAddress || undefined,
    };

    setFilters(newFilters); // ✅ update context
    navigation.navigate('SpacesMain');
  };


  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>Post Type</Text>


      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        {/* FIX: Map over the explicitly typed array and remove the type annotation from the callback parameter */}
        {postTypesOptions.map((type) => ( // 'type' will now be correctly inferred by TypeScript from 'postTypesOptions'
          <TouchableOpacity
            key={type}
            onPress={() => setPostType(type)} // This line remains correct
            style={{
              padding: 10,
              borderWidth: 1,
              borderRadius: 8,
              backgroundColor: postType === type ? '#007AFF' : '#fff',
              borderColor: postType === type ? '#007AFF' : '#ccc',
            }}
          >
            <Text style={{ color: postType === type ? '#fff' : '#333' }}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* New UI: Location input button */}
      <TouchableOpacity
        style={{ padding: 10, backgroundColor: '#eee', borderRadius: 6, marginBottom: 12 }}
        onPress={async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access location was denied. Cannot use current location.');
            return;
          }
          try {
            const location = await Location.getCurrentPositionAsync({});
            setSelectedLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
            // You might want to reverse geocode to get an address here
            // For simplicity, we'll just set a placeholder address if location is acquired
            setLocationAddress('Current Location'); // Set a placeholder address
            Alert.alert('Location Set', 'Your current location has been captured.');
          } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert('Location Error', 'Could not get current location. Please try again.');
          }
        }}
      >
        <Text>{selectedLocation ? `Location Set ✓` : 'Use Current Location'}</Text>
      </TouchableOpacity>

      {/* Address Text Input (User can manually enter or it can be set by geolocation) */}
      <Text style={styles.sectionTitle}>Address (e.g. for searching)</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={locationAddress}
          onChangeText={setLocationAddress}
          placeholder="Enter address or use current location"
          autoCapitalize="words"
        />
      </View>


      {/* CATEGORY SLIDER */}
      <Text style={styles.sectionTitle}>What are you storing?</Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isSelected = selectedCategories.includes(item.id);
          return (
            <TouchableOpacity
              onPress={() => toggleCategory(item.id)}
              style={[styles.categoryItem, isSelected && styles.selectedCategory]}
            >
              <Image source={item.image} style={styles.categoryImage} />
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* MAX PRICE */}
      <Text style={styles.sectionTitle}>Max Price ($)</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          value={maxPrice}
          onChangeText={setMaxPrice}
          placeholder="Enter max price"
        />
      </View>

      {/* CALENDAR RANGE */}
      <Text style={styles.sectionTitle}>Select Storage Dates</Text>
      <Calendar
        onDayPress={(day) => {
          if (!startDate || (startDate && endDate)) {
            setStartDate(day.dateString);
            setEndDate('');
          } else {
            // Ensure end date is after start date
            if (day.dateString >= startDate) {
                setEndDate(day.dateString);
            } else {
                // If selected end date is before start date, restart selection
                setStartDate(day.dateString);
                setEndDate('');
                Alert.alert('Invalid Date', 'End date cannot be before start date. Please re-select.');
            }
          }
        }}
        markedDates={{
          ...(startDate
            ? {
                [startDate]: {
                  selected: true,
                  startingDay: true,
                  color: 'blue',
                  textColor: 'white',
                },
              }
            : {}),
          ...(endDate
            ? {
                [endDate]: {
                  selected: true,
                  endingDay: true,
                  color: 'blue',
                  textColor: 'white',
                },
              }
            : {}),
            // Mark period between start and end date
            ...(startDate && endDate ? (() => {
                const dates: { [key: string]: any } = {};
                let currentDate = new Date(startDate);
                let lastDate = new Date(endDate);
                while (currentDate <= lastDate) {
                    const dateString = currentDate.toISOString().split('T')[0];
                    if (dateString !== startDate && dateString !== endDate) {
                        dates[dateString] = { color: 'lightblue', textColor: 'black' };
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                return dates;
            })() : {})
        }}
        markingType={'period'}
      />

      {/* LOCATION RADIUS SLIDER */}
      <Text style={styles.sectionTitle}>Search Radius: {radius} km</Text>
      <Slider
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={radius}
        onValueChange={(value) => setRadius(value)}
        style={{ width: '100%' }}
      />

      {/* PICK-UP / DROP-OFF */}
      <View style={styles.toggleRow}>
        <Text style={styles.sectionTitle}>Pick-up & Drop-off available</Text>
        <Switch value={pickupDropoff} onValueChange={setPickupDropoff} />
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.buttonText}>Reset Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyFilters} // Call the useCallback function
        >
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  categoryList: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    width: 100,
  },
  selectedCategory: {
    borderColor: '#007AFF',
    backgroundColor: '#e6f0ff',
  },
  categoryImage: {
    width: 50,
    height: 50,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  categoryLabel: {
    fontSize: 14,
    textAlign: 'center',
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
  resetButton: {
    flex: 1,
    marginRight: 10,
    padding: 14,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    marginLeft: 10,
    padding: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%', // Changed from '90%' for better alignment
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
