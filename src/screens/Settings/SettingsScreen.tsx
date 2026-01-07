

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';


type Navigation = {
  navigate: (screen: string) => void;
};

// Enable layout animation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const navigation = useNavigation<Navigation>();
  // const [user, setUser] = useState<{ stripeOnboardingComplete: boolean } | null>(null);

  const [user, setUser] = useState<{
    stripe?: {
      onboardingComplete?: boolean;
    };
  } | null>(null);
  



  // -------------------------------
  // GROUPS WITH DROPDOWN SUBITEMS
  // -------------------------------



  const groupedSettings = [
    {
      groupTitle: "Payments & Payouts",
      screens: [
        { title: "Get Started / Onboarding", screen: "StripeOnboarding" },
        { title: "Add / Remove Payment Methods", screen: "PaymentMethods" },
        { title: "Manage Payout Account", screen: "PayoutAccounts" },
        { title: "Transaction History", screen: "TransactionHistory" },
        { title: "Billing & Receipts", screen: "BillingReceipts" },
        { title: "Tax Forms (Hosts)", screen: "TaxForms", requiresOnboarding: true },
      ]
    }
  ];
  


  // -------------------------------
  // FLAT, SINGLE-CLICK SETTINGS
  // -------------------------------

  const miscSettings = [
    { title: 'Change Password', screen: 'ChangePassword' },
    { title: 'Verify ID', screen: 'VerifyID' },
    { title: 'Request for Views', screen: 'RequestForViews' },
    { title: 'Earnings', screen: 'Earnings' },
    { title: 'Terms and Conditions', screen: 'TermsAndConditions' },
    { title: 'Version', screen: 'Version' },
    { title: 'Language', screen: 'Language' },
    { title: "What's New?", screen: 'WhatsNew' },
  ];



  // -------------------------------
  // EXPAND STATE
  // -------------------------------
  
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const toggleGroup = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // -------------------------------
  // ACCOUNT ACTION HANDLERS
  // -------------------------------

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await auth.signOut();
          } catch (error) {
            Alert.alert("Error", "Failed to log out.");
          }
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} },
      ]
    );
  };


  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      }
      


    };

    fetchUserData();
  }, []);




  // -------------------------------
  // RENDER
  // -------------------------------

  return (
    <ScrollView style={styles.container}>

      {/* GROUPED SETTINGS */}
      {groupedSettings.map(group => (
        <View key={group.groupTitle}>
          <TouchableOpacity
            style={styles.groupHeader}
            onPress={() => toggleGroup(group.groupTitle)}
          >
            <Text style={styles.groupHeaderText}>{group.groupTitle}</Text>
            <Text style={styles.chevron}>
              {expanded[group.groupTitle] ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expanded[group.groupTitle] && (


            <View style={styles.subItemsContainer}>

              {group.screens.map(({ title, screen, requiresOnboarding }) => {
                const isDisabled = requiresOnboarding && !user?.stripe?.onboardingComplete;

                return (
                  <TouchableOpacity
                    key={title}
                    style={[styles.row, styles.subRow, isDisabled && styles.disabledRow]}
                    onPress={() => {
                      if (!isDisabled) navigation.navigate(screen);
                      else Alert.alert(
                        "Complete Onboarding First",
                        "You must finish the Stripe onboarding setup before accessing this feature."
                      );
                    }}
                    disabled={isDisabled}
                  >
                    <Text style={[styles.rowText, isDisabled && styles.disabledText]}>
                      {title}
                    </Text>
                  </TouchableOpacity>
                );
              })}





            </View>


          )}

        </View>
      ))}

      <View style={styles.sectionDivider} />


      {/* MISC SETTINGS */}
      {miscSettings.map(({ title, screen }) => (
        <TouchableOpacity
          key={title}
          style={styles.row}
          onPress={() => navigation.navigate(screen)}
        >
          <Text style={styles.rowText}>{title}</Text>
        </TouchableOpacity>
      ))}

      {/* LOGOUT */}
      <TouchableOpacity style={styles.row} onPress={handleLogout}>
        <Text style={styles.rowText}>Logout</Text>
      </TouchableOpacity>

      {/* DELETE ACCOUNT */}
      <TouchableOpacity style={[styles.row, styles.deleteRow]} onPress={handleDeleteAccount}>
        <Text style={[styles.rowText, styles.deleteText]}>Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}






const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* GROUP HEADER */
  groupHeader: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f7',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupHeaderText: { fontSize: 17, fontWeight: '600' },
  chevron: { fontSize: 16 },

  /* SUB-ITEMS */
  subItemsContainer: { backgroundColor: '#fafafa' },

  /* ROW */
  row: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  rowText: {
    fontSize: 15,
  },

  /* DELETE */
  deleteRow: {
    backgroundColor: '#ffe6e6',
  },
  deleteText: {
    color: '#cc0000',
    fontWeight: 'bold',
  },
  sectionDivider: {
    height: 24,
    backgroundColor: "#f2f2f7",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
  },
  subRow: {
    paddingLeft: 40,   // creates indentation
    backgroundColor: "#fdfdfd",
  },
  disabledRow: {
    backgroundColor: "#f5f5f5",
  },
  disabledText: {
    color: "#999",
  },
  
  
  
});
