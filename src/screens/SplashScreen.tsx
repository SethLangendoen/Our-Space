


import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Use replace to ensure that the splash screen is not part of the navigation stack
      navigation.replace('MainTabs');
    }, 2000); // 2 seconds delay for splash screen

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/newLogoText.jpg')} style={styles.logoImage} />
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
    width: width * 0.5,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
});
