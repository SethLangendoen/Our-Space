

import { match } from 'assert';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// Import icons
const iconsMap: { [key: string]: any } = {
  'Cars/Trucks': require('../../assets/postIcons/vehicle.png'),
  RV: require('../../assets/postIcons/rv.png'),
  Boats: require('../../assets/postIcons/boat.png'),
  Personal: require('../../assets/postIcons/personal.png'),
  Business: require('../../assets/postIcons/business.png'),
};

interface SpaceCardProps {
  item: any;
  onPress: () => void;
  matchScore?: number;        // number of matching filters
  totalFilters?: number;      // total filters considered
}

const SpaceCard = ({ item, onPress, matchScore, totalFilters }: SpaceCardProps) => {

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

      {/* Match Score Badge */}
      {console.log(matchScore + " is the matchscore, " + totalFilters + 'Is the total filters')}
      {matchScore !== undefined && totalFilters !== undefined && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>
            Matched {matchScore} of {totalFilters} filters
          </Text>
        </View>
      )}

      {/* Description */}
      {item.description && <Text style={styles.description}>{item.description}</Text>}

      {/* Price + Icons */}
      <View style={styles.priceRow}>
      {item.price && (
        <Text style={styles.price}>
          ${parseFloat(item.price).toFixed(2)} {' '}
          {(item.priceFrequency ?? 'daily').charAt(0).toUpperCase() +
            (item.priceFrequency ?? 'daily').slice(1)}
        </Text>
      )}


        <View style={styles.iconRow}>
          {item.usageType &&
            item.usageType.map((type: string) =>
              iconsMap[type] ? (
                <Image
                  key={type}
                  source={iconsMap[type]}
                  style={styles.icon}
                  resizeMode="contain"
                />
              ) : null
            )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },

  mainImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 12,
    resizeMode: 'cover',
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F6B5B',
    flex: 1,
  },

  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },

  offeringTag: {
    backgroundColor: '#629447',
  },

  requestingTag: {
    backgroundColor: '#F3AF1D',
  },

  tagText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },

  // Match Score Badge
  matchBadge: {
    backgroundColor: '#DFF5D1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },

  matchBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#0F6B5B',
  },

  description: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#444',
  },

  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#0F6B5B',
  },

  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },

  icon: {
    width: 22,
    height: 22,
    marginLeft: 6,
  },
});

export default SpaceCard;
