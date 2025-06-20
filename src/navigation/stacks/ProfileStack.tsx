import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
// import SecurityScreen from '../../screens/Settings/SecurityScreen';
import NotificationsScreen from '../../screens/profile/NotificationsScreen';
import PrivacyScreen from '../../screens/profile/PrivacyScreen';
import SettingsStack from './SettingsStack';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      {/* <Stack.Screen name="Security" component={SecurityScreen} options={{ title: 'Security' }} /> */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy' }} />
      <Stack.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{ headerShown: false }} // Let the nested SettingsStack handle its own headers
      />
    </Stack.Navigator>
  );
}
