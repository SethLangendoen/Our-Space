import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import React from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';

type AppHeaderProps = {
  navigation: NativeStackNavigationProp<any>;
  showSettings?: boolean;
};

// Map route names to friendly display names
const routeNameMap: Record<string, string> = {
  SpacesMain: 'Browse',
  MySpacesMain: 'My Spaces',
  ChatsMain: 'Messages',
  ProfileMain: 'Profile',
  Filters: 'Filters',
  'Space Detail Screen': 'Space Details',
  UserProfile: 'User Profile',
  EditSpaceScreen: 'Edit Space',
  ConfirmedReservationScreen: 'Reservation Confirmed',
  MessagesScreen: 'Messages',
  EditProfile: 'Edit Profile',
  SettingsStack: 'Settings',
  RequestDetailScreen: 'Booking',
  CreateAccount: 'Authentication',
  ForgotPassword: 'Authentication',
  Login: 'Authentication',
  CreateSpaceScreen: 'Create Space',
  RulesScreen: 'Agreement',
};

export default function AppHeader({ navigation, showSettings }: AppHeaderProps) {
  // const route = useRoute();
  const route = useRoute<any>();

  const routeName = route.name;

  const mainTabScreens: string[] = ['SpacesMain', 'Profile', 'Bookings'];
  const showBackButton = navigation.canGoBack() && !mainTabScreens.includes(routeName);

  // Get the friendly title from the map, fallback to routeName if not mapped
  const displayTitle = routeNameMap[routeName] || routeName;

const fromRoute = route.params?.from;

const handleBack = () => {
  if (fromRoute) {
    navigation.navigate(fromRoute);
  } else {
    navigation.goBack(); // fallback
  }
};



  return (
    <View style={styles.container}>
      {/* Left: Back button */}
      {showBackButton ? (
        <TouchableOpacity onPress={handleBack}>
          <Image source={require('../../assets/backArrow.png')} style={styles.icon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconSpacer} />
      )}

      {/* Center: Logo and Title */}
      <View style={styles.logoTitleContainer}>
        <Image
          source={require('../../assets/ourSpaceLogos/boxOnly.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{displayTitle}</Text>
      </View>

      {/* Right: Settings or spacer */}
      {showSettings ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('SettingsStack', { screen: 'SettingsScreen' })
          }
        >
          <Image source={require('../../assets/settings.png')} style={styles.icon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 100,
    paddingTop: 60,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  icon: {
    width: 28,
    height: 28,
  },
  iconSpacer: {
    width: 28,
  },
  logoTitleContainer: {
    flexDirection: 'row', // horizontal layout
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});