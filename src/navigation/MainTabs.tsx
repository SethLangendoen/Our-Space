


import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SpacesStack from './stacks/SpacesStack';
import ProfileStack from './stacks/ProfileStack';
import ChatsStack from './stacks/ChatsStack';
import MySpacesStack from './stacks/MySpacesStack';
import AuthStack from './stacks/AuthStack';
import { Image, View, Text, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ParamListBase } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { registerForPushNotifications } from 'src/Helpers/notifications';
import { doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const Tab = createBottomTabNavigator();




export default function MainTabs() {

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // true if user exists
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        total += data.unreadCount?.[user.uid] ?? 0;
      });

      setTotalUnread(total);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  useEffect(() => {
    const setupPush = async () => {
      const user = auth.currentUser;

      if (!user) {
        console.log('no user')
        return
      };
  
      const token = await registerForPushNotifications();
      if (!token) {
        console.log('no token')
        return
      };
  
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
  
      const existingTokens = userSnap.data()?.expoPushTokens || [];
      
      // prevent duplicates
      if (!existingTokens.includes(token)) {
        await setDoc(
          userRef,
          {
            expoPushTokens: arrayUnion(token),
          },
          { merge: true }
        );
      }
    };
  
    setupPush();
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
          tabBarLabel: 'Browse',
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
            <View style={{ width: 28, height: 28 }}>
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

              {totalUnread > 0 && (
                <View style={styles.chatBadgeContainer}>
                <Text style={styles.chatBadgeText}>
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </Text>
                </View>
              )}
            </View>
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
            style={{ width: 36, height: 36 }}
          />
        </TouchableOpacity>
      ) : null,
  })}
/>




      

    </Tab.Navigator>
  );





}


const styles = StyleSheet.create({
  chatBadgeContainer: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F3AF1D',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  chatBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F6B5B',
  },
});