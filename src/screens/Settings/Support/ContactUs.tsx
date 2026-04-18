import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

export default function ContactUsScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>
        Contact Us
      </Text>

      <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
	  Need a little extra help? Our team is here to support you with general questions, account help, or anything else you need along the way.
      </Text>

      <TouchableOpacity
        style={{
          marginTop: 24,
          backgroundColor: '#255C2F',
          padding: 14,
          borderRadius: 10,
        }}
        onPress={() =>
          Linking.openURL('https://ourspacetech.com/contact-us/')
        }
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
			Contact Our Team ↗
        </Text>
      </TouchableOpacity>
    </View>
  );
}