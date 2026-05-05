import React from 'react';
import { View, Animated } from 'react-native';

const SpaceCardSkeleton = () => {
  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 15,
      marginVertical: 10,
    }}>

      {/* Title */}
      <View style={{ width: 180, height: 18, backgroundColor: '#E0E0E0', borderRadius: 4 }} />

      {/* Subtitle */}
      <View style={{ width: 120, height: 12, marginTop: 8, backgroundColor: '#E0E0E0', borderRadius: 4 }} />

      {/* Image */}
      <View style={{
        width: '100%',
        height: 150,
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        marginTop: 12,
      }} />

      {/* Bottom row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <View style={{ width: 80, height: 14, backgroundColor: '#E0E0E0', borderRadius: 4 }} />
        <View style={{ width: 60, height: 14, backgroundColor: '#E0E0E0', borderRadius: 4 }} />
      </View>

    </View>
  );
};

export default SpaceCardSkeleton;