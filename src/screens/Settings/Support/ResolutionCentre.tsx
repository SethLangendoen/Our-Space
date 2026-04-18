import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

export default function ResolutionCentreScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>
        Resolution Centre
      </Text>

      <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
	  If something has not gone as expected, we are here to help. Visit the Resolution Centre to report an issue, submit a dispute, or get support with a booking concern.
      </Text>

      <TouchableOpacity
        style={{
          marginTop: 24,
          backgroundColor: '#255C2F',
          padding: 14,
          borderRadius: 10,
        }}
        onPress={() =>
          Linking.openURL('https://ourspacetech.com/resolution-centre/')
        }
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
			Visit Resolution Centre ↗
        </Text>
      </TouchableOpacity>
    </View>
  );
}