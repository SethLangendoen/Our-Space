
import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { COLORS } from '../Styles/theme';
import { useFocusEffect } from '@react-navigation/native';

type Navigation = {
  navigate: (screen: string) => void;
};

// Enable layout animation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SettingsScreen() {
  const navigation = useNavigation<Navigation>();

  const [user, setUser] = useState<any>(null);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  // -------------------------------
  // SETTINGS STRUCTURE
  // -------------------------------
  const groupedSettings = [
    {
      groupTitle: 'Host Onboarding',
      screens: [
        { title: 'User Agreements', screen: 'HostUserAgreements' }, // DONE
        { title: 'Stripe Account Setup', screen: 'StripeOnboarding' },
        { title: 'Hosting Guide', screen: 'HostingGuide' }, // NEED PAGE
      ],
    },
    {
      groupTitle: 'Renter Onboarding',
      screens: [
        { title: 'User Agreements', screen: 'RenterUserAgreements' }, // DONE
        { title: 'Payment Setup', screen: 'PaymentMethods' },
        { title: 'Verify Identity', screen: 'VerifyID' },
        { title: 'Renters Guide', screen: 'RentersGuide' }, // NEED PAGE
      ],
    },
    {
      groupTitle: 'Payments & Payouts',
      screens: [
        { title: 'Transaction History', screen: 'TransactionHistory' }, 
        { title: 'Earnings', screen: 'Earnings' },
        { title: 'Manage Payout Account (Hosts)', screen: 'PayoutAccounts' },
        { title: 'Manage Payment Methods (Renters)', screen: 'PaymentMethods' },
      ],
    },
    {
      groupTitle: 'Manage Account',
      screens: [
        { title: 'Update Account Information', screen: 'UpdateAccount' }, // NEED PAGE
        { title: 'Change Password', screen: 'ChangePassword' },
        { title: 'Delete Account', screen: 'DeleteAccount' }, // NEED PAGE
      ],
    },
    {
      groupTitle: 'Support',
      screens: [
        { title: 'Help Centre', screen: 'HelpCentre' }, // NEED PAGE (link to site)
        { title: 'Contact Us', screen: 'ContactUs' }, // NEED PAGE (link to site)
        { title: 'Resolution Centre', screen: 'ResolutionCentre' }, // NEED PAGE (link to site)
        { title: 'Feedback', screen: 'Feedback' }, // NEED PAGE (link to site) Same functionality as contact us. 
      ],
    },
    {
      groupTitle: 'Legal Documents',
      screens: [
        { title: 'Terms and Conditions', screen: 'TermsAndConditions' },
        { title: 'Privacy Policy', screen: 'PrivacyPolicy' }, // NEED PAGE 
      ],
    },
  ];

  const miscSettings = [
    { title: 'Notifications', screen: 'Notifications' },
    { title: "What's New", screen: 'WhatsNew' },
    { title: 'Version 1.0', screen: 'Version' },
  ];

  const getHostOnboardingStatus = (user: any) => {
    const legalDone = user?.legal?.host?.userAgreementSigned === true;
  
    const stripeDone =
      user?.stripe?.host?.onboardingComplete === true &&
      user?.stripe?.host?.chargesEnabled === true &&
      user?.stripe?.host?.payoutsEnabled === true;
  
    const guideDone = user?.onboarding?.host?.guideComplete === true;
  
    const completed =
      Number(legalDone) + Number(stripeDone) + Number(guideDone);
  
    return {
      legalDone,
      stripeDone,
      guideDone,
      completed,
      total: 3,
    };
  };

  const getRenterOnboardingStatus = (user: any) => {
    const legalDone = user?.legal?.renter?.userAgreementSigned === true;
  
    const paymentDone = !!user?.stripe?.customer?.defaultPaymentMethod;
  
    const guideDone = user?.onboarding?.renter?.guideComplete === true;
  
    const completed =
      Number(legalDone) + Number(paymentDone) + Number(guideDone);
  
    return {
      legalDone,
      paymentDone,
      guideDone,
      completed,
      total: 3,
    };
  };


  const isCompleted = (groupTitle: string, title: string) => {
    if (!user) return false;
  
    if (groupTitle === 'Host Onboarding') {
      if (title === 'User Agreements') return hostProgress?.legalDone;
      if (title === 'Stripe Account Setup') return hostProgress?.stripeDone;
      if (title === 'Hosting Guide') return hostProgress?.guideDone;
    }
  
    if (groupTitle === 'Renter Onboarding') {
      if (title === 'User Agreements') return renterProgress?.legalDone;
      if (title === 'Payment Setup') return renterProgress?.paymentDone;
      if (title === 'Renters Guide') return renterProgress?.guideDone;
    }
  
    return false;
  };



  // -------------------------------
  // ACCORDION TOGGLE
  // -------------------------------
  const toggleGroup = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpanded((prev) => ({
      [title]: !prev[title],
    }));
  };

  // -------------------------------
  // LOGOUT HANDLER
  // -------------------------------
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await auth.signOut();
          } catch {
            Alert.alert('Error', 'Failed to log out.');
          }
        },
      },
    ]);
  };

  // -------------------------------
  // FETCH USER DATA
  // -------------------------------
  // useEffect(() => {

  // const fetchUserData = async () => {
  //   const userId = auth.currentUser?.uid;
  //   if (!userId) return;

  //   const userDoc = await getDoc(doc(db, 'users', userId));
  //   if (userDoc.exists()) {
  //     setUser(userDoc.data());
  //   }
  // };

  //   fetchUserData();
  // }, []);

    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
  
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      }
    };


  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const hostProgress = user ? getHostOnboardingStatus(user) : null;
  const renterProgress = user ? getRenterOnboardingStatus(user) : null;

  
  return (
    <ScrollView style={styles.container}>
      {groupedSettings.map((group) => (
        <View key={group.groupTitle}>
          <TouchableOpacity
            style={styles.groupHeader}
            onPress={() => toggleGroup(group.groupTitle)}
          >
          <View>
            <Text style={styles.groupHeaderText}>
              {group.groupTitle}
            </Text>

            {group.groupTitle === 'Host Onboarding' && hostProgress && (
              <Text style={styles.progressText}>
                Actions required ({hostProgress.completed}/3)
              </Text>
            )}

            {group.groupTitle === 'Renter Onboarding' && renterProgress && (
              <Text style={styles.progressText}>
                Actions required ({renterProgress.completed}/3)
              </Text>
            )}
          </View>

            <Text style={styles.chevron}>
              {expanded[group.groupTitle] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>


          {expanded[group.groupTitle] && (
            <View style={styles.subItemsContainer}>
              {group.screens.map(({ title, screen }) => (
                <TouchableOpacity
                  key={title}
                  style={[styles.row, styles.subRow]}
                  onPress={() => navigation.navigate(screen)}
                >

              <View style={styles.rowContent}>
                <Text style={styles.rowText}>
                  {title}
                </Text>

                {(group.groupTitle === 'Host Onboarding' ||
                  group.groupTitle === 'Renter Onboarding') && (
                  <Text
                    style={[
                      styles.statusText,
                      isCompleted(group.groupTitle, title)
                        ? styles.statusComplete
                        : styles.statusPending,
                    ]}
                  >
                    {isCompleted(group.groupTitle, title)
                      ? 'Complete'
                      : 'Action required'}
                  </Text>
                )}
              </View>


                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.sectionDivider} />

      {miscSettings.map(({ title, screen }) => (
        <TouchableOpacity
          key={title}
          style={styles.row}
          onPress={() => navigation.navigate(screen)}
        >
          <Text style={styles.rowText}>{title}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.row} onPress={handleLogout}>
        <Text style={styles.rowText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lighterGrey,
  },

  groupHeader: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f7',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  groupHeaderText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },

  chevron: {
    fontSize: 14,
    color: '#6B7280',
  },

  subItemsContainer: {
    backgroundColor: '#FAFAFA',
  },

  row: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  subRow: {
    paddingLeft: 40,
  },

  rowText: {
    fontSize: 15,
    color: '#374151',
  },

  sectionDivider: {
    height: 24,
    backgroundColor: '#f2f2f7',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  completedText: {
    color: '#16A34A',
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  statusComplete: {
    color: '#16A34A', // green
  },
  
  statusPending: {
    color: '#DC2626', // red
  },
});



