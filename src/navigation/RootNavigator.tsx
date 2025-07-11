// RootNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'src/screens/SplashScreen';
import MainTabs from './MainTabs';
// import userProfileScreen from 'src/screens/UserProfileScreen'
const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
      <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        {/* <Stack.Screen name="UserProfileScreen" component={userProfileScreen} /> */}

      </Stack.Navigator>
  );
};

export default RootNavigator;
