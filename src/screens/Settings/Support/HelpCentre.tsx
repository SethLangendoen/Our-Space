import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

export default function HelpCentreScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>
        Help Centre
      </Text>

      <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
	  Looking for a quick answer? Our Help Centre is here to guide you through common questions about bookings, payments, listings, account settings, and how OurSpace works.      
	  </Text>

      <TouchableOpacity
        style={{
          marginTop: 24,
          backgroundColor: '#255C2F',
          padding: 14,
          borderRadius: 10,
        }}
        onPress={() =>
          Linking.openURL('https://ourspacetech.com/help-centre/')
        }
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
			Visit Help Centre ↗
        </Text>
      </TouchableOpacity>
    </View>
  );
}