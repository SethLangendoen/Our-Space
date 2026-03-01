// // src/navigation/ChatsStack.tsx
// import React from 'react';

// import { createNativeStackNavigator, NativeStackHeaderProps } from '@react-navigation/native-stack';
// import ChatsScreen from 'src/screens/chats/ChatsScreen';
// import MessagesScreen from 'src/screens/chats/MessagesScreen';
// import AppHeader from 'src/components/AppHeader';

// const Stack = createNativeStackNavigator();

// // Type your navigation prop
// type ChatsScreenNavigationProp = NativeStackNavigationProp<
//   ChatsStackParamList,
//   'ChatsMain'
// >;

// const navigation = useNavigation<ChatsScreenNavigationProp>();

// export default function ChatsStack() {
//   return (
//     <Stack.Navigator
//     screenOptions={{
//       header: ({ navigation }: NativeStackHeaderProps) => <AppHeader navigation={navigation} />,
//     }}
//     >

//       <Stack.Screen name="ChatsMain" component={ChatsScreen} options={{ title: 'Chats' }} />
//       <Stack.Screen name="MessagesScreen" component={MessagesScreen} options={{ title: 'Conversation' }} />
//     </Stack.Navigator>
//   );
// }

// src/navigation/ChatsStack.tsx
import React from 'react';
import { createNativeStackNavigator, NativeStackHeaderProps } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ChatsScreen from 'src/screens/chats/ChatsScreen';
import MessagesScreen from 'src/screens/chats/MessagesScreen';
import AppHeader from 'src/components/AppHeader';

// 1️⃣ Define the param list for this stack
export type ChatsStackParamList = {
  ChatsMain: undefined;
  MessagesScreen: {
    chatId: string;
    otherUser: string;
  };
};

// 2️⃣ Create the stack with types
const Stack = createNativeStackNavigator<ChatsStackParamList>();

export default function ChatsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        // Use custom header
        header: ({ navigation, route, options }: NativeStackHeaderProps) => (
          <AppHeader navigation={navigation} />
        ),
      }}
    >
      {/* 3️⃣ Define screens */}
      <Stack.Screen
        name="ChatsMain"
        component={ChatsScreen}
        options={{ title: 'Chats' }}
      />
      <Stack.Screen
        name="MessagesScreen"
        component={MessagesScreen}
        options={{ title: 'Conversation' }}
      />
    </Stack.Navigator>
  );
}