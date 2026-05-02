import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { auth, db } from '../../firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const loadStatus = async () => {
      if (!user) return;

      const snap = await getDoc(doc(db, 'users', user.uid));
      const tokens = snap.data()?.expoPushTokens || [];

      setEnabled(tokens.length > 0);
    };

    loadStatus();
  }, []);

  /**
   * ENABLE NOTIFICATIONS
   */
  const enableNotifications = async () => {
    if (!user) return;

    try {
      if (!Device.isDevice) {
        Alert.alert('Must use physical device');
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } =
          await Notifications.requestPermissionsAsync();

        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission denied');
        setEnabled(false);
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      const tokenData =
        await Notifications.getExpoPushTokenAsync({ projectId });

      const expoPushToken = tokenData.data;

      if (!expoPushToken) return;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      const existingTokens =
        snap.data()?.expoPushTokens || [];

      if (!existingTokens.includes(expoPushToken)) {
        await setDoc(
          userRef,
          {
            expoPushTokens: arrayUnion(expoPushToken),
          },
          { merge: true }
        );
      }

      setEnabled(true);
    } catch (err) {
      console.log('Enable notifications error', err);
    }
  };

  /**
   * DISABLE NOTIFICATIONS
   */
  const disableNotifications = async () => {
    if (!user) return;

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      const tokenData =
        await Notifications.getExpoPushTokenAsync({ projectId });

      const expoPushToken = tokenData.data;

      const userRef = doc(db, 'users', user.uid);

      await setDoc(
        userRef,
        {
          expoPushTokens: arrayRemove(expoPushToken),
        },
        { merge: true }
      );

      setEnabled(false);
    } catch (err) {
      console.log('Disable notifications error', err);
    }
  };

  const toggleSwitch = async (value: boolean) => {
    setEnabled(value);

    if (value) {
      await enableNotifications();
    } else {
      await disableNotifications();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notifications</Text>

      <View style={styles.row}>
        <Text>Enable Push Notifications</Text>

        <Switch
          value={enabled}
          onValueChange={toggleSwitch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});