

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SpacesScreen from '../../screens/spaces/SpacesScreen';
import FiltersScreen from '../../screens/spaces/FiltersScreen';
import SpaceDetailScreen from 'src/screens/spaces/SpaceDetailScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import AppHeader from 'src/components/AppHeader';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function SpacesStack() {
  return (
    <Stack.Navigator
    screenOptions={{
      header: ({ navigation }: NativeStackHeaderProps) => <AppHeader navigation={navigation} />,
    }}
    >


      
      <Stack.Screen name="SpacesMain" component={SpacesScreen} />
      <Stack.Screen name="Filters" component={FiltersScreen} />
      <Stack.Screen name="SpaceDetail" component={SpaceDetailScreen} />
      <Stack.Screen name="UserProfile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
