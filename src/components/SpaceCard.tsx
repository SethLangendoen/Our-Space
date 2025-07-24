// components/SpaceCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface SpaceCardProps {
  item: any;
  onPress: () => void;
}

const SpaceCard = ({ item, onPress }: SpaceCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Main Image */}
      {item.mainImage && (
        <Image
          source={{ uri: item.mainImage }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      )}

      {/* Title and Tag Row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{item.title || 'No Title'}</Text>
        {item.postType && (
          <View
            style={[
              styles.tag,
              item.postType === 'Offering' ? styles.offeringTag : styles.requestingTag,
            ]}
          >
            <Text style={styles.tagText}>{item.postType}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      {item.description && <Text style={styles.description}>{item.description}</Text>}

      {/* Price */}
      {item.price && (
        <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  mainImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  offeringTag: {
    backgroundColor: '#4CAF50',
  },
  requestingTag: {
    backgroundColor: '#F44336',
  },
  tagText: {
    color: '#fff',
    fontWeight: '600',
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    color: '#555',
  },
  price: {
    marginTop: 6,
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
});

export default SpaceCard;
