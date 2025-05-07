import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // for custom icons
import SpacesStack from './stacks/SpacesStack';
import ProfileStack from './stacks/ProfileStack';
import ChatsStack from './stacks/ChatsStack';
import MySpacesStack from './stacks/MySpacesStack';
import useUserProfileStatus from '../hooks/UseUserProfileStatus';
import AuthStack from './stacks/AuthStack';
 
const Tab = createBottomTabNavigator();

export default function MainTabs() {


  // add back later when you fix auth, since the hook uses the auth check
  // const profileComplete = useUserProfileStatus();
  // // Wait until status is resolved
  // if (profileComplete === null) return null; // or a loading spinner

    const profileComplete = null;



  return (
    <Tab.Navigator initialRouteName="Spaces">
      <Tab.Screen
        name="Spaces"
        component={SpacesStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'} // Active vs Inactive icon
              size={28}
              color={focused ? '#6A5ACD' : '#000'} // Active vs Inactive color
            />
          ),
        }}
      />
      <Tab.Screen
        name="MySpaces"
        component={MySpacesStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Ionicons
              name={focused ? 'cube' : 'cube-outline'} // Active vs Inactive icon
              size={28}
              color={focused ? '#6A5ACD' : '#000'} // Active vs Inactive color
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Ionicons
              name={focused ? 'chatbubble' : 'chatbubble-outline'} // Active vs Inactive icon
              size={28}
              color={focused ? '#6A5ACD' : '#000'} // Active vs Inactive color
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={profileComplete ? ProfileStack : AuthStack}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'} // Active vs Inactive icon
              size={28}
              color={focused ? '#6A5ACD' : '#000'} // Active vs Inactive color
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
