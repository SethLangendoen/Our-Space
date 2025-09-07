import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { FilterProvider } from './src/context/FilterContext'; // ✅

export default function App() {
  return (

    <FilterProvider> 
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </FilterProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
