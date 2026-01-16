

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';

import RootNavigator from './src/navigation/RootNavigator';
import { FilterProvider } from './src/context/FilterContext';

export default function App() {
  return (
    <StripeProvider
    publishableKey={process.env.EXPO_PUBLIC_STRIPE_KEY || ""}
    merchantIdentifier="merchant.com.yourapp" // required for Apple Pay
    >
      <FilterProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </FilterProvider>
    </StripeProvider>
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

