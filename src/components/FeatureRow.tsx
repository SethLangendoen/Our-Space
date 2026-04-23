// src/components/FeatureRow.tsx

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FEATURE_ICONS } from '../constants/featureIcons';

export default function FeatureRow({ label }: { label: string }) {
  const icon = FEATURE_ICONS[label];

  return (
    <View style={styles.row}>
      {icon && <Image source={icon} style={styles.icon} />}
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  
  row: {
	flexDirection: 'row',
	alignItems: 'center',
	width: '50%',          // 👈 THIS is the key
	paddingVertical: 0
  },
  
  icon: {
    width: 38,
    height: 38,
    marginRight: 8,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
});
