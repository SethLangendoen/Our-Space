// src/screens/SplashScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      {/* Replace this with your logo or animation */}
      <Text style={styles.logoText}>OurSpace</Text>
      <ActivityIndicator size="large" color="#4B7BEC" />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // or your brand background color
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
