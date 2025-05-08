


import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Use replace to ensure that the splash screen is not part of the navigation stack
      navigation.replace('MainTabs');
    }, 3000); // 2 seconds delay for splash screen

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* <Image source={require('../../assets/ourSpaceLogos/party.GIF')} style={styles.logoImage} /> */}
      <Image source={require('../../assets/ourSpaceLogos/party.gif')} style={styles.logoImage} />

    </View>
  );
};

export default SplashScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: width * 0.6,       // Try a more reasonable width, like 40% of screen
    height: width * 0.6,      // Explicit height to match
    resizeMode: 'contain',
  },
  
});


