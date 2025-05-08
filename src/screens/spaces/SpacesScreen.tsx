import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Circle } from 'react-native-maps';


/* some notes: 
- once posts are in place, we can dynamically add markers. 

*/ 



// Step 1: Define your navigation stack params
type RootStackParamList = {
  Spaces: undefined;
  Filters: undefined;
};

// Step 2: Type the navigation prop for this screen
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Spaces'>;

export default function SpacesScreen() {
  const [isMapView, setIsMapView] = useState(false);

  // Step 3: Use the typed navigation
  const navigation = useNavigation<NavigationProp>();

  const toggleView = () => setIsMapView(prev => !prev);


  const radiusCenter = { latitude: 43.6532, longitude: -79.3832 }; // Example: Toronto
const radiusInMeters = 3000; // 3 km radius


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
		<MapView
		style={styles.mapView}
		initialRegion={{
			latitude: 43.6532,  // Example: Toronto
			longitude: -79.3832,
			latitudeDelta: 0.05,
			longitudeDelta: 0.05,
		}}
		>
		<Circle
			center={radiusCenter}
			radius={radiusInMeters}
			strokeColor="rgba(0,0,255,0.5)"
			fillColor="rgba(0,0,255,0.1)"
		/>

			{[
			{
				id: 'A',
				title: 'Storage Space A',
				description: 'Click for more info',
				coordinate: { latitude: 43.6532, longitude: -79.3832 },
			},
			{
				id: 'B',
				title: 'Storage Space B',
				description: 'Click for more info',
				coordinate: { latitude: 43.7540, longitude: -79.3840 },
			},
			{
				id: 'C',
				title: 'Storage Space C',
				description: 'Click for more info',
				coordinate: { latitude: 43.6525, longitude: -78.3820 },
			},
			{
				id: 'D',
				title: 'Storage Space D',
				description: 'Click for more info',
				coordinate: { latitude: 44.6515, longitude: -79.3850 },
			},
			].map(space => (
			<Marker
				key={space.id}
				coordinate={space.coordinate}
				title={space.title}
				description={space.description}
				onPress={() => console.log(`${space.title} pressed`)}
			/>
			))}
		</MapView>
      ) : (
        <FlatList
          data={[{ id: '1', title: 'Example Space' }]}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>{item.title}</Text>
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
});



