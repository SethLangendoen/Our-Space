// src/navigation/MySpacesStack.tsx
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MySpacesScreen from '../../screens/mySpaces/MySpacesScreen';
import CreateSpaceScreen from '../../screens/mySpaces/CreateSpaceScreen';

const Stack = createNativeStackNavigator();

export default function MySpacesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MySpacesMain" component={MySpacesScreen} options={{ title: 'My Spaces' }} />
      <Stack.Screen name="CreateSpaceScreen" component={CreateSpaceScreen} options={{ title: 'Create Space' }} />
    </Stack.Navigator>
  );
}
