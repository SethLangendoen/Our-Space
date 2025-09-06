


import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SpacesStack from './stacks/SpacesStack';
import ProfileStack from './stacks/ProfileStack';
import ChatsStack from './stacks/ChatsStack';
import MySpacesStack from './stacks/MySpacesStack';
import useUserProfileStatus from '../hooks/UseUserProfileStatus';
import AuthStack from './stacks/AuthStack';
import { Image, View, Text } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ParamListBase } from '@react-navigation/native';

import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AppHeader from '../components/AppHeader';
import { NONAME } from 'dns';


const Tab = createBottomTabNavigator();


export default function MainTabs() {
  // const profileComplete = useUserProfileStatus();
  // const profileComplete = null;

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // true if user exists
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);



  return (


    <Tab.Navigator
      initialRouteName="Spaces"
      screenOptions={{
        tabBarActiveTintColor: '#255C2F',
        tabBarInactiveTintColor: '#7B7B7B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          fontFamily: 'Helvetica Neue',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: 10,
          height: 70,
        },
        // header: () => <AppHeader />,   // 👈 swap out for custom header
        headerShown: false, // hides header for all screens in this navigator

      }}
    >


      <Tab.Screen
        name="Spaces"
        component={SpacesStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={
                focused
                  ? require('../../assets/bottomNavIcons/spacesFill.png')
                  : require('../../assets/bottomNavIcons/spaces.png')
              }
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? undefined : '#000',
              }}
            />
          ),
          tabBarLabel: 'Spaces',
        }}
      />
      <Tab.Screen
        name="MySpaces"
        component={MySpacesStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={
                focused
                  ? require('../../assets/bottomNavIcons/mySpacesFill.png')
                  : require('../../assets/bottomNavIcons/mySpaces.png')
              }
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? undefined : '#000',
              }}
            />
          ),
          tabBarLabel: 'My Spaces',
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={
                focused
                  ? require('../../assets/bottomNavIcons/chatFill.png')
                  : require('../../assets/bottomNavIcons/chat.png')
              }
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? undefined : '#000',
              }}
            />
          ),
          tabBarLabel: 'Chats',
        }}
      />


<Tab.Screen
  name="Profile"
  component={isLoggedIn ? ProfileStack : AuthStack}
  options={({ navigation }: { navigation: BottomTabNavigationProp<ParamListBase> }) => ({
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <Image
        source={
          focused
            ? require('../../assets/bottomNavIcons/profileFill.png')
            : require('../../assets/bottomNavIcons/profile.png')
        }
        style={{ width: 28, height: 28, tintColor: focused ? undefined : '#000' }}
      />
    ),
    tabBarLabel: 'Profile',
    headerRight: () =>
      isLoggedIn ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Profile', {
              screen: 'SettingsStack',
              params: { screen: 'SettingsScreen' },
            })
          }
          style={{ marginRight: 15 }}
        >
          <Image
            source={require('../../assets/settings.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      ) : null,
  })}
/>




      

    </Tab.Navigator>
  );
}
