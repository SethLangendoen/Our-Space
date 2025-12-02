import React from 'react';
import { createNativeStackNavigator, NativeStackHeaderProps } from '@react-navigation/native-stack';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import EditProfileScreen from '../../screens/profile/EditProfileScreen';
// import SecurityScreen from '../../screens/Settings/SecurityScreen';
import NotificationsScreen from '../../screens/profile/NotificationsScreen';
import PrivacyScreen from '../../screens/profile/PrivacyScreen';
import SettingsStack from './SettingsStack';
import SpaceDetailScreen from 'src/screens/spaces/SpaceDetailScreen';
import AppHeader from 'src/components/AppHeader';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    // <Stack.Navigator
    // screenOptions={{
    //   header: ({ navigation }: NativeStackHeaderProps) => <AppHeader navigation={navigation} />,
    // }}
    // >

<Stack.Navigator
  screenOptions={{
    header: ({ navigation }: NativeStackHeaderProps) => (
      <AppHeader navigation={navigation} />
    ),
  }}
>
  <Stack.Screen
    name="ProfileMain"
    component={ProfileScreen}
    options={{
      header: ({ navigation }: NativeStackHeaderProps) => (
        <AppHeader navigation={navigation} showSettings={true} />
      ),
    }}
  />
  <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  <Stack.Screen name="Notifications" component={NotificationsScreen} />
  <Stack.Screen name="Privacy" component={PrivacyScreen} />
  <Stack.Screen name="SpaceDetail" component={SpaceDetailScreen} />
  <Stack.Screen
    name="SettingsStack"
    component={SettingsStack}
    options={{ headerShown: false }}
  />
</Stack.Navigator>

  );

}


