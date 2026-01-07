// src/navigation/ChatsStack.tsx
import React from 'react';

import { createNativeStackNavigator, NativeStackHeaderProps } from '@react-navigation/native-stack';
import ChatsScreen from 'src/screens/chats/ChatsScreen';
import MessagesScreen from 'src/screens/chats/MessagesScreen';
import AppHeader from 'src/components/AppHeader';

const Stack = createNativeStackNavigator();


export default function ChatsStack() {
  return (
    <Stack.Navigator
    screenOptions={{
      header: ({ navigation }: NativeStackHeaderProps) => <AppHeader navigation={navigation} />,
    }}
    >

      <Stack.Screen name="ChatsMain" component={ChatsScreen} options={{ title: 'Chats' }} />
      <Stack.Screen name="MessagesScreen" component={MessagesScreen} options={{ title: 'Conversation' }} />
    </Stack.Navigator>
  );
}
