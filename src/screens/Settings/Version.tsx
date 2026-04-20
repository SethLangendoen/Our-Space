import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../Styles/theme'; // make sure this includes your colors

type Update = {
  version: string;
  date: string;
  changes: string[];
};

const updates: Update[] = [
  {
    version: '1.2.0',
    date: 'March 15, 2026',
    changes: [
      'Added ability to filter spaces by requests, ongoing, and previous.',
      'Improved onboarding flow for new hosts.',
      'Fixed minor UI bugs in My Spaces page.'
    ]
  },
  {
    version: '1.1.0',
    date: 'February 28, 2026',
    changes: [
      'Introduced new profile settings layout.',
      'Added notifications for upcoming reservations.',
      'Enhanced security for password updates.'
    ]
  },
  {
    version: '1.0.0',
    date: 'January 20, 2026',
    changes: [
      'Initial release of Our Space app!',
      'Users can list, browse, and book storage spaces.'
    ]
  }
];

export default function Version() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {updates.map((update) => (
        <View key={update.version} style={styles.updateCard}>
          <Text style={styles.version}>Version {update.version}</Text>
          <Text style={styles.date}>{update.date}</Text>
          {update.changes.map((change, idx) => (
            <Text key={idx} style={styles.change}>• {change}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lighterGrey || '#f6f6f6',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#005337', // Emerald Green
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  updateCard: {
    backgroundColor: '#fff', // Soft cream background
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  version: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005337', // Emerald Green
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  date: {
    fontSize: 12,
    color: '#48912a', // Earthy Green
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  change: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
});