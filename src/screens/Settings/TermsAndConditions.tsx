// import React from 'react';
// import { ScrollView, View, Text, StyleSheet } from 'react-native';

// export default function TermsAndConditions() {
//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      // <Text style={styles.header}>Terms and Conditions</Text>

      // <Text style={styles.sectionTitle}>1. Introduction</Text>
      // <Text style={styles.paragraph}>
      //   Welcome to <Text style={styles.bold}>Our Space</Text>! These Terms and Conditions ("Terms") govern your use of our peer-to-peer storage platform, including our website and mobile application (collectively, the "Service"). By accessing or using Our Space, you agree to these Terms.
      // </Text>

      // <Text style={styles.sectionTitle}>2. Eligibility</Text>
      // <Text style={styles.paragraph}>
      //   You must be at least 18 years old and have the legal capacity to enter into binding contracts. By using the Service, you represent and warrant that you meet these eligibility requirements.
      // </Text>

      // <Text style={styles.sectionTitle}>3. Account Registration</Text>
      // <Text style={styles.paragraph}>
      //   To use the Service, you must create an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and all activity that occurs under your account.
      // </Text>

      // <Text style={styles.sectionTitle}>4. Listings and Bookings</Text>
      // <Text style={styles.paragraph}>
      //   Users may list storage spaces for rent and book available spaces. As a host, you agree to provide accurate descriptions, pricing, and availability of your storage space. As a renter, you agree to follow all usage rules and guidelines provided by the host.
      // </Text>
      // <Text style={styles.paragraph}>
      //   Our Space is a platform provider and is not responsible for the quality, safety, or legality of listed spaces.
      // </Text>

      // <Text style={styles.sectionTitle}>5. Payments</Text>
      // <Text style={styles.paragraph}>
      //   All payments are processed through our integrated payment system. Hosts set their own pricing, and Our Space may collect service fees as disclosed. You agree to pay all applicable fees and taxes.
      // </Text>

      // <Text style={styles.sectionTitle}>6. Cancellations and Refunds</Text>
      // <Text style={styles.paragraph}>
      //   Cancellation policies are set by individual hosts. Refunds, if any, will be handled according to the host’s policy. Our Space may mediate disputes but is not obligated to provide refunds outside of these policies.
      // </Text>

      // <Text style={styles.sectionTitle}>7. User Conduct</Text>
      // <Text style={styles.paragraph}>
      //   Users must comply with all applicable laws and regulations. Prohibited activities include:
      // </Text>
      // <Text style={styles.paragraph}>
      //   • Listing fraudulent or illegal spaces{"\n"}
      //   • Harassment or abuse of other users{"\n"}
      //   • Attempting unauthorized access to accounts or data{"\n"}
      //   • Storing prohibited items in rented spaces
      // </Text>

      // <Text style={styles.sectionTitle}>8. Liability and Indemnification</Text>
      // <Text style={styles.paragraph}>
      //   You acknowledge that Our Space is not liable for personal injury, property damage, or loss arising from your use of the Service. Users agree to indemnify and hold Our Space harmless from any claims, damages, or expenses resulting from their actions.
      // </Text>

      // <Text style={styles.sectionTitle}>9. Privacy</Text>
      // <Text style={styles.paragraph}>
      //   Your use of the Service is subject to our Privacy Policy, which explains how we collect, use, and protect your information.
      // </Text>

      // <Text style={styles.sectionTitle}>10. Dispute Resolution</Text>
      // <Text style={styles.paragraph}>
      //   Any disputes between users should first be attempted to be resolved directly. If unresolved, disputes may be mediated through Our Space or legally pursued according to the governing law.
      // </Text>

      // <Text style={styles.sectionTitle}>11. Termination</Text>
      // <Text style={styles.paragraph}>
      //   We may suspend or terminate your account for violations of these Terms or other unlawful or harmful activities. Users may also terminate their accounts at any time.
      // </Text>

      // <Text style={styles.sectionTitle}>12. Modifications</Text>
      // <Text style={styles.paragraph}>
      //   Our Space may update these Terms from time to time. Continued use of the Service after updates constitutes acceptance of the modified Terms.
      // </Text>

      // <Text style={styles.sectionTitle}>13. Governing Law</Text>
      // <Text style={styles.paragraph}>
      //   These Terms are governed by and construed in accordance with the laws of the jurisdiction in which Our Space operates.
      // </Text>

      // <Text style={styles.sectionTitle}>14. Contact</Text>
      // <Text style={styles.paragraph}>
      //   If you have any questions regarding these Terms, please contact us at <Text style={styles.link}>support@ourspacetech.com</Text>.
      // </Text>

      // <Text style={styles.footer}>
      //   Last updated: March 2026
      // </Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f6f6f6',
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#005337',
//     marginBottom: 20,
//     fontFamily: 'Poppins-Bold',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#005337',
//     marginBottom: 8,
//     marginTop: 16,
//     fontFamily: 'Poppins-Bold',
//   },
//   paragraph: {
//     fontSize: 14,
//     color: '#333',
//     lineHeight: 22,
//     fontFamily: 'Poppins-Regular',
//   },
//   bold: {
//     fontWeight: '700',
//   },
//   link: {
//     color: '#ffba00',
//     textDecorationLine: 'underline',
//   },
//   footer: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 40,
//     textAlign: 'center',
//     fontFamily: 'Poppins-Regular',
//   },
// });


import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function TermsAndConditions() {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    // Check if the user already accepted terms
    const fetchAcceptance = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setAccepted(userDoc.data()?.acceptedTerms || false);
        }
      } catch (err) {
        console.error('Failed to fetch terms acceptance:', err);
      }
    };

    fetchAcceptance();
  }, [userId]);

  const handleAccept = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), {
        acceptedTerms: true,
        acceptedTermsAt: new Date() // optional timestamp
      });
      setAccepted(true);
      Alert.alert('Thank you!', 'You have accepted the Terms & Conditions.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save your acceptance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Existing Terms & Conditions content */}

      <Text style={styles.header}>Terms and Conditions</Text>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.paragraph}>
        Welcome to <Text style={styles.bold}>Our Space</Text>! These Terms and Conditions ("Terms") govern your use of our peer-to-peer storage platform, including our website and mobile application (collectively, the "Service"). By accessing or using Our Space, you agree to these Terms.
      </Text>

      <Text style={styles.sectionTitle}>2. Eligibility</Text>
      <Text style={styles.paragraph}>
        You must be at least 18 years old and have the legal capacity to enter into binding contracts. By using the Service, you represent and warrant that you meet these eligibility requirements.
      </Text>

      <Text style={styles.sectionTitle}>3. Account Registration</Text>
      <Text style={styles.paragraph}>
        To use the Service, you must create an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and all activity that occurs under your account.
      </Text>

      <Text style={styles.sectionTitle}>4. Listings and Bookings</Text>
      <Text style={styles.paragraph}>
        Users may list storage spaces for rent and book available spaces. As a host, you agree to provide accurate descriptions, pricing, and availability of your storage space. As a renter, you agree to follow all usage rules and guidelines provided by the host.
      </Text>
      <Text style={styles.paragraph}>
        Our Space is a platform provider and is not responsible for the quality, safety, or legality of listed spaces.
      </Text>

      <Text style={styles.sectionTitle}>5. Payments</Text>
      <Text style={styles.paragraph}>
        All payments are processed through our integrated payment system. Hosts set their own pricing, and Our Space may collect service fees as disclosed. You agree to pay all applicable fees and taxes.
      </Text>

      <Text style={styles.sectionTitle}>6. Cancellations and Refunds</Text>
      <Text style={styles.paragraph}>
        Cancellation policies are set by individual hosts. Refunds, if any, will be handled according to the host’s policy. Our Space may mediate disputes but is not obligated to provide refunds outside of these policies.
      </Text>

      <Text style={styles.sectionTitle}>7. User Conduct</Text>
      <Text style={styles.paragraph}>
        Users must comply with all applicable laws and regulations. Prohibited activities include:
      </Text>
      <Text style={styles.paragraph}>
        • Listing fraudulent or illegal spaces{"\n"}
        • Harassment or abuse of other users{"\n"}
        • Attempting unauthorized access to accounts or data{"\n"}
        • Storing prohibited items in rented spaces
      </Text>

      <Text style={styles.sectionTitle}>8. Liability and Indemnification</Text>
      <Text style={styles.paragraph}>
        You acknowledge that Our Space is not liable for personal injury, property damage, or loss arising from your use of the Service. Users agree to indemnify and hold Our Space harmless from any claims, damages, or expenses resulting from their actions.
      </Text>

      <Text style={styles.sectionTitle}>9. Privacy</Text>
      <Text style={styles.paragraph}>
        Your use of the Service is subject to our Privacy Policy, which explains how we collect, use, and protect your information.
      </Text>

      <Text style={styles.sectionTitle}>10. Dispute Resolution</Text>
      <Text style={styles.paragraph}>
        Any disputes between users should first be attempted to be resolved directly. If unresolved, disputes may be mediated through Our Space or legally pursued according to the governing law.
      </Text>

      <Text style={styles.sectionTitle}>11. Termination</Text>
      <Text style={styles.paragraph}>
        We may suspend or terminate your account for violations of these Terms or other unlawful or harmful activities. Users may also terminate their accounts at any time.
      </Text>

      <Text style={styles.sectionTitle}>12. Modifications</Text>
      <Text style={styles.paragraph}>
        Our Space may update these Terms from time to time. Continued use of the Service after updates constitutes acceptance of the modified Terms.
      </Text>

      <Text style={styles.sectionTitle}>13. Governing Law</Text>
      <Text style={styles.paragraph}>
        These Terms are governed by and construed in accordance with the laws of the jurisdiction in which Our Space operates.
      </Text>

      <Text style={styles.sectionTitle}>14. Contact</Text>
      <Text style={styles.paragraph}>
        If you have any questions regarding these Terms, please contact us at <Text style={styles.link}>support@ourspacetech.com</Text>.
      </Text>

      <Text style={styles.footer}>
        Last updated: March 2026
      </Text>
      {/* Accept Button */}
      {!accepted && (
        <TouchableOpacity
          style={[styles.acceptButton, loading && { opacity: 0.6 }]}
          onPress={handleAccept}
          disabled={loading}
        >
          <Text style={styles.acceptText}>
            {loading ? 'Saving...' : 'I Accept Terms & Conditions'}
          </Text>
        </TouchableOpacity>
      )}

      {accepted && (
        <Text style={styles.acceptedNotice}>
          ✅ You have accepted the Terms & Conditions.
        </Text>
      )}


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#005337',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#005337',
    marginBottom: 8,
    marginTop: 16,
    fontFamily: 'Poppins-Bold',
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    fontFamily: 'Poppins-Regular',
  },
  bold: { fontWeight: '700' },
  link: { color: '#ffba00', textDecorationLine: 'underline' },
  footer: {
    fontSize: 12,
    color: '#999',
    marginTop: 40,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  acceptButton: {
    marginTop: 30,
    backgroundColor: '#005337',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Bold',
  },
  acceptedNotice: {
    marginTop: 30,
    fontSize: 16,
    color: '#48912a',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
});