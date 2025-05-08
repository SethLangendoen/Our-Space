// src/navigation/ChatsStack.tsx
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatsScreen from 'src/screens/chats/ChatsScreen';
import MessagesScreen from 'src/screens/chats/MessagesScreen';

const Stack = createNativeStackNavigator();

export default function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatsMain" component={ChatsScreen} options={{ title: 'Chats' }} />
      <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: 'Conversation' }} />
    </Stack.Navigator>
  );
}
