

// RootNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from 'src/screens/SplashScreen';
import OnboardingScreen from 'src/screens/OnboardingScreen';

import MainTabs from './MainTabs';
import AuthStack from './stacks/AuthStack';

const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
      <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
  );
};

export default RootNavigator;
