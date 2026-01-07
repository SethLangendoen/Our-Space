// src/navigation/MySpacesStack.tsx
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MySpacesScreen from '../../screens/mySpaces/MySpacesScreen';
import CreateSpaceScreen from '../../screens/mySpaces/CreateSpaceScreen';
import EditSpaceScreen from '../../screens/mySpaces/EditSpaceScreen'; // ✅ Import it
import RequestDetailScreen from '../../screens/mySpaces/RequestDetailScreen';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import AppHeader from 'src/components/AppHeader';
import RulesScreen from '../../screens/mySpaces/RulesScreen';
import { MySpacesStackParamList } from '../../types/types'; // wherever you put it

// const Stack = createNativeStackNavigator<MySpacesStackParamList>();

const Stack = createNativeStackNavigator();

export default function MySpacesStack() {
  return (
    <Stack.Navigator
    screenOptions={{
      header: ({ navigation }: NativeStackHeaderProps) => <AppHeader navigation={navigation} />,
    }}
    >

      <Stack.Screen name="MySpacesMain" component={MySpacesScreen} options={{ title: 'My Spaces' }} />
      <Stack.Screen name="CreateSpaceScreen" component={CreateSpaceScreen} options={{ title: 'Create Space' }} />
      <Stack.Screen name="EditSpaceScreen" component={EditSpaceScreen} options={{ title: 'Edit Space' }} />
      <Stack.Screen name="RequestDetailScreen" component={RequestDetailScreen} />
      <Stack.Screen
        name="RulesScreen"
        component={RulesScreen}
        options={{ title: 'Rules & Regulations' }}
      />

    </Stack.Navigator>
  );
}
