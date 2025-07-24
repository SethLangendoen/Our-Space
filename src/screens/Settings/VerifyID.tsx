import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function VerifyID() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Verify Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});
 