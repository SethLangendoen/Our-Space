import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SpacesScreen from '../../screens/spaces/SpacesScreen';
import FiltersScreen from '../../screens/spaces/FiltersScreen';
import SpaceDetailScreen from 'src/screens/spaces/SpaceDetailScreen';
// import UserProfileScreen from 'src/screens/UserProfileScreen'; 
import ProfileScreen from '../../screens/profile/ProfileScreen';


const Stack = createNativeStackNavigator();

export default function SpacesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SpacesMain" component={SpacesScreen} options={{ title: 'Spaces' }} />
      <Stack.Screen name="Filters" component={FiltersScreen} />
      <Stack.Screen name="SpaceDetail" component={SpaceDetailScreen} />
      {/* <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} /> */}
      <Stack.Screen name="UserProfile" component={ProfileScreen} />


    </Stack.Navigator>
  );
}
