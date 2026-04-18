import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';

export default function FeedbackScreen() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>
        Feedback
      </Text>

      <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>
	  	We are always looking for ways to make OurSpace better. Share your thoughts, ideas, or suggestions — we would love to hear from you.
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
			Share Feedback ↗
        </Text>
      </TouchableOpacity>
    </View>
  );
}