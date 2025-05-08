


import React, { useState } from 'react';
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
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Slider from '@react-native-community/slider'; // Replace with expo-slider if using Expo

const categories = [
  { id: '1', label: 'Personal', image: require('../../../assets/filter/personal.jpeg') },
  { id: '2', label: 'Business', image: require('../../../assets/filter/business.jpeg') },
  { id: '3', label: 'Boat', image: require('../../../assets/filter/boat.jpeg') },
  { id: '4', label: 'RV', image: require('../../../assets/filter/rv.jpeg') },
];




export default function FiltersScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [radius, setRadius] = useState(10);
  const [maxPrice, setMaxPrice] = useState('');
  const [pickupDropoff, setPickupDropoff] = useState(false);

  



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
    setPickupDropoff(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
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
            setEndDate(day.dateString);
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
          onPress={() => {
            // Handle Apply
          }}
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
    paddingBottom: 48, // Ensures space for buttons
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
    width: '90%',
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
