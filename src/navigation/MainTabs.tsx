


import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SpacesStack from './stacks/SpacesStack';
import ProfileStack from './stacks/ProfileStack';
import ChatsStack from './stacks/ChatsStack';
import MySpacesStack from './stacks/MySpacesStack';
import useUserProfileStatus from '../hooks/UseUserProfileStatus';
import AuthStack from './stacks/AuthStack';
import { Image, View, Text } from 'react-native';

import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';



const Tab = createBottomTabNavigator();


export default function MainTabs() {
  // const profileComplete = useUserProfileStatus();
  const profileComplete = null;

  return (
    // <Tab.Navigator
    //   initialRouteName="Spaces"
    //   screenOptions={{
    //     tabBarActiveTintColor: '#255C2F', // Active label color
    //     tabBarInactiveTintColor: '#7B7B7B',  // Inactive label color
    //     tabBarLabelStyle: {
    //       fontSize: 12,
    //       fontWeight: '600',
    //       fontFamily: 'Helvetica Neue', // Replace with your custom font if loaded
    //     },
    //     tabBarStyle: {
    //       backgroundColor: '#fff',
    //       paddingBottom: 5,
    //       height: 60,
    //     },
    //   }}
    // >


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
    paddingBottom: 5,
    height: 60,
  },
  headerTitle: () => (
    <Image
      source={require('../../assets/ourSpaceLogos/ourSpaceHorizontal.png')}
      style={{ width: 180, height: 160 }}
      resizeMode="contain"
    />
  ),
  headerTitleAlign: 'center',
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
        component={profileComplete ? ProfileStack : AuthStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Image
              source={
                focused
                  ? require('../../assets/bottomNavIcons/profileFill.png')
                  : require('../../assets/bottomNavIcons/profile.png')
              }
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? undefined : '#000',
              }}
            />
          ),
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
