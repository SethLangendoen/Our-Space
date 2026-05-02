


import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SpacesStack from './stacks/SpacesStack';
import ProfileStack from './stacks/ProfileStack';
import ChatsStack from './stacks/ChatsStack';
import MySpacesStack from './stacks/MySpacesStack';
import AuthStack from './stacks/AuthStack';
import { Image, View, Text, StyleSheet, Platform } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ParamListBase } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { doc, setDoc, arrayUnion, getDoc, addDoc } from 'firebase/firestore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

const Tab = createBottomTabNavigator();

// // Optional: foreground behavior
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });



// export default function MainTabs() {

//   const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
//   const [totalUnread, setTotalUnread] = useState(0);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setIsLoggedIn(!!user);
//     });

//     return unsubscribe;
//   }, []);

//   useEffect(() => {
//     if (!isLoggedIn) return;

//     const user = auth.currentUser;
//     if (!user) return;

//     const q = query(
//       collection(db, 'chats'),
//       where('users', 'array-contains', user.uid)
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       let total = 0;

//       snapshot.docs.forEach((chatDoc) => {
//         const data = chatDoc.data();
//         total += data.unreadCount?.[user.uid] ?? 0;
//       });

//       setTotalUnread(total);
//     });

//     return () => unsubscribe();
//   }, [isLoggedIn]);

//   useEffect(() => {
//     const registerForPushNotifications = async () => {
//       const user = auth.currentUser;

//       if (!user) {
//         console.log('No authenticated user');
//         return;
//       }

//       if (!Device.isDevice) {
//         console.log('Must use physical device for push notifications');
//         return;
//       }

//       try {
//         // Android notification channel
//         if (Platform.OS === 'android') {
//           await Notifications.setNotificationChannelAsync('default', {
//             name: 'default',
//             importance: Notifications.AndroidImportance.MAX,
//             vibrationPattern: [0, 250, 250, 250],
//             lightColor: '#FF231F7C',
//           });
//         }

//         // Check existing permissions
//         const { status: existingStatus } =
//           await Notifications.getPermissionsAsync();

//         let finalStatus = existingStatus;

//         // Ask user if needed
//         if (existingStatus !== 'granted') {
//           const { status } = await Notifications.requestPermissionsAsync();
//           finalStatus = status;
//         }

//         if (finalStatus !== 'granted') {
//           console.log('Push notification permission denied');
//           return;
//         }

//         // Get Expo push token
//         const projectId =
//           Constants.expoConfig?.extra?.eas?.projectId ||
//           Constants.easConfig?.projectId;

//         if (!projectId) {
//           console.log('Missing Expo projectId');
//           return;
//         }

//         const tokenData = await Notifications.getExpoPushTokenAsync({
//           projectId,
//         });

//         const expoPushToken = tokenData.data;

//         console.log('Expo Push Token:', expoPushToken);

//         if (!expoPushToken) return;

//         // Save token to Firestore
//         const userRef = doc(db, 'users', user.uid);
//         const userSnap = await getDoc(userRef);

//         const existingTokens = userSnap.data()?.expoPushTokens || [];

//         if (!existingTokens.includes(expoPushToken)) {
//           await setDoc(
//             userRef,
//             {
//               expoPushTokens: arrayUnion(expoPushToken),
//             },
//             { merge: true }
//           );
//         }
//       } catch (err) {
//         console.error('Expo notification setup error:', err);
//       }
//     };

//     if (isLoggedIn) {
//       registerForPushNotifications();
//     }
//   }, [isLoggedIn]);








// import React, { useEffect, useState } from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import SpacesStack from './stacks/SpacesStack';
// import ProfileStack from './stacks/ProfileStack';
// import ChatsStack from './stacks/ChatsStack';
// import MySpacesStack from './stacks/MySpacesStack';
// import AuthStack from './stacks/AuthStack';
// import { Image, View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth, db } from '../firebase/config';
// import { doc, setDoc, arrayUnion, getDoc, addDoc, collection } from 'firebase/firestore';
// import { query, where, onSnapshot } from 'firebase/firestore';

// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import Constants from 'expo-constants';

// const Tab = createBottomTabNavigator();

/**
 * Firestore logger (TestFlight debugging)
 */
const logToFirestore = async (message: string, meta?: any) => {
  try {
    await addDoc(collection(db, 'logs'), {
      message,
      meta: meta || null,
      userId: auth.currentUser?.uid || null,
      timestamp: new Date(),
    });
  } catch (e) {
    console.log('logToFirestore failed', e);
  }
};

// Notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function MainTabs() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  /**
   * AUTH STATE
   */
  useEffect(() => {
    logToFirestore('MainTabs mounted - listening for auth state');

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);

      logToFirestore('Auth state changed', {
        loggedIn: !!user,
        userId: user?.uid,
      });
    });

    return unsubscribe;
  }, []);

  /**
   * UNREAD MESSAGES LISTENER
   */
  useEffect(() => {
    if (!isLoggedIn) {
      logToFirestore('Skipping unread listener - not logged in');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      logToFirestore('No auth.currentUser in unread listener');
      return;
    }

    logToFirestore('Starting unread listener', { userId: user.uid });

    const q = query(
      collection(db, 'chats'),
      where('users', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;

      snapshot.docs.forEach((chatDoc) => {
        const data = chatDoc.data();
        total += data.unreadCount?.[user.uid] ?? 0;
      });

      setTotalUnread(total);

      logToFirestore('Unread count updated', {
        totalUnread: total,
        chatCount: snapshot.docs.length,
      });
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  /**
   * PUSH NOTIFICATION REGISTRATION
   */
  useEffect(() => {
    const registerForPushNotifications = async () => {
      const user = auth.currentUser;

      if (!user) {
        logToFirestore('Push setup aborted - no user');
        return;
      }

      logToFirestore('Starting push setup', { userId: user.uid });

      if (!Device.isDevice) {
        logToFirestore('Push setup failed - not physical device');
        return;
      }

      try {
        /**
         * STEP 1: Permissions
         */
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        logToFirestore('Existing notification permission', {
          status: existingStatus,
        });

        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } =
            await Notifications.requestPermissionsAsync();

          finalStatus = status;

          logToFirestore('Permission requested', {
            newStatus: finalStatus,
          });
        }

        if (finalStatus !== 'granted') {
          logToFirestore('Permission denied');
          return;
        }

        /**
         * STEP 2: Project ID
         */
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ||
          Constants.easConfig?.projectId;

        logToFirestore('Project ID resolved', { projectId });

        if (!projectId) {
          logToFirestore('Missing projectId');
          return;
        }

        /**
         * STEP 3: Get Expo push token
         */
        const tokenData =
          await Notifications.getExpoPushTokenAsync({ projectId });

        const expoPushToken = tokenData.data;

        logToFirestore('Expo token generated', {
          token: expoPushToken,
        });

        if (!expoPushToken) return;

        /**
         * STEP 4: Save to Firestore
         */
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        const existingTokens =
          userSnap.data()?.expoPushTokens || [];

        logToFirestore('Existing tokens loaded', {
          count: existingTokens.length,
        });

        if (!existingTokens.includes(expoPushToken)) {
          await setDoc(
            userRef,
            {
              expoPushTokens: arrayUnion(expoPushToken),
            },
            { merge: true }
          );

          logToFirestore('Token saved to Firestore');
        } else {
          logToFirestore('Token already exists - skipping save');
        }
      } catch (err) {
        logToFirestore('Push setup error', {
          error: String(err),
        });
      }
    };

    if (isLoggedIn) {
      registerForPushNotifications();
    }
  }, [isLoggedIn]);







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