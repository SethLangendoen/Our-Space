


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
      navigation.replace('Onboarding');
    }, 2000); 

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
    backgroundColor: '#FFFCF1', // Wheat/Cream Background for warmth
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: width * 0.5,       // Adjusted to 50% for cleaner spacing
    height: width * 0.5,
    resizeMode: 'contain',
  },
});

