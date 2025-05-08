// src/navigation/stacks/SettingsStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../../screens/settings/SettingsScreen';
// import AccountSettingsScreen from '../../screens/settings/AccountSettingsScreen'; // example additional page
import SecurityScreen from 'src/screens/Settings/SecurityScreen';


const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator>
		<Stack.Screen
		name="Settings"
		component={SettingsStack}
		options={{ presentation: 'modal', headerShown: false }}
		/>
	  <Stack.Screen name="SecurityScreen" component={SecurityScreen} options={{ title: 'Security' }} />

      {/* <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: 'Account Settings' }} /> */}
    </Stack.Navigator>
  );
}
