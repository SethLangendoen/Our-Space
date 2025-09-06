import React from 'react';

import { createNativeStackNavigator, NativeStackHeaderProps } from '@react-navigation/native-stack';
import CreateAccountScreen from '../../screens/Auth/CreateAccountScreen';
import LoginScreen from '../../screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../../screens/Auth/ForgotPasswordScreen';
import AppHeader from 'src/components/AppHeader';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
    screenOptions={{
      header: ({ navigation }: NativeStackHeaderProps) => <AppHeader navigation={navigation} />,
    }}
    >     
    
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ title: 'Create Account' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
    </Stack.Navigator>
  );
}
