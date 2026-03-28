
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';

type RootStackParamList = {
  SplashScreen: undefined;
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const [showGif, setShowGif] = useState(true);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let navTimeout: NodeJS.Timeout;

    // Listen for Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      // Hide GIF after 2s
      timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShowGif(false));
      }, 2000);

      // Navigate after GIF duration
      navTimeout = setTimeout(() => {
        if (user) {
          // Authenticated → MainTabs
          navigation.replace('MainTabs');
        } else {
          // Not logged in → Onboarding
          navigation.replace('Onboarding');
        }
      }, 1000); // slightly longer than fade to ensure smooth transition
    });

    return () => {
      clearTimeout(timeout);
      clearTimeout(navTimeout);
      unsubscribe();
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {showGif && (
        <Animated.Image
          source={require('../../assets/ourSpaceLogos/party.gif')}
          style={[styles.logoImage, { opacity: fadeAnim }]}
        />
      )}
    </View>
  );
};

export default SplashScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: width * 0.5,
    height: width * 0.5,
    resizeMode: 'contain',
  },
});
