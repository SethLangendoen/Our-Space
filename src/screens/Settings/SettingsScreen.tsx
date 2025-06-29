import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase/config'; // Adjust path as needed
import { doc, deleteDoc } from 'firebase/firestore';

type Navigation = {
  navigate: (screen: string) => void;
};

export default function SettingsScreen() {
  const navigation = useNavigation<Navigation>();

  const settingsItems = [
    { title: 'Billing Account', screen: 'BillingAccount' },
    { title: 'Change Password', screen: 'ChangePassword' },
    { title: 'Verify ID', screen: 'VerifyID' },
    { title: 'Request for Views', screen: 'RequestForViews' },
    { title: 'Earnings', screen: 'Earnings' },
    { title: 'Terms and Conditions', screen: 'TermsAndConditions' },
    { title: 'Version', screen: 'Version' },
    { title: 'Language', screen: 'Language' },
    { title: "What's New?", screen: 'WhatsNew' },
    { title: 'Logout', screen: 'Logout' },
    { title: 'Delete Account', screen: 'DeleteAccount' },
  ];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        onPress: async () => {
          try {
            await auth.signOut();
            console.log('User logged out');
            // Optionally navigate to login screen here
            // navigation.navigate('LoginScreen'); 
          } catch (error) {
            console.error('Logout failed:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        } 
      },
    ]);
  };
  

  /* HANDLE THIS FUNCTIONALITY LATER ON 
  - Prior to account deletion, a user must not have ongoing contracts with others. Those must be resolved. 
  */ 
  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action is irreversible.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => console.log('User account deleted') },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {settingsItems.map(({ title, screen }) => {
        // Special cases for logout and delete account buttons
        if (title === 'Logout') {
          return (
            <TouchableOpacity key={title} style={styles.row} onPress={handleLogout}>
              <Text style={styles.rowText}>{title}</Text>
            </TouchableOpacity>
          );
        }
        if (title === 'Delete Account') {
          return (
            <TouchableOpacity key={title} style={[styles.row, styles.deleteRow]} onPress={handleDeleteAccount}>
              <Text style={[styles.rowText, styles.deleteText]}>{title}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={title}
            style={styles.row}
            onPress={() => navigation.navigate(screen)}
          >
            <Text style={styles.rowText}>{title}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
  },
  rowText: {
    fontSize: 16,
  },
  deleteRow: {
    backgroundColor: '#ffe6e6',
  },
  deleteText: {
    color: '#cc0000',
    fontWeight: 'bold',
  },
});
