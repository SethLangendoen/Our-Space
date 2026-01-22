

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

// Usage icons
const iconsMap: { [key: string]: any } = {
  'Cars/Trucks': require('../../assets/postIcons/vehicle.png'),
  RV: require('../../assets/postIcons/rv.png'),
  Boats: require('../../assets/postIcons/boat.png'),
  Personal: require('../../assets/postIcons/personal.png'),
  Business: require('../../assets/postIcons/business.png'),
};

// Save / unsave icons
const saveIcons = {
  saved: require('assets/filter/bookmark.png'),
  unsaved: require('assets/filter/bookmark-outline.png'),
};

interface SpaceCardProps {
  item: any;
  onPress: () => void;

  isSaved?: boolean;
  onToggleSave?: () => void;

  matchScore?: number;
  totalFilters?: number;
  showPublicPrivateBadge?: boolean;
}

const SpaceCard = ({
  item,
  onPress,
  isSaved,
  onToggleSave,
  matchScore,
  totalFilters,
  showPublicPrivateBadge,
}: SpaceCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>

      
      {/* ---------- Title + Badge ---------- */}
{/* ---------- Title + Badge / Filter Match ---------- */}
<View style={styles.titleRow}>
  <View style={{ flex: 1 }}>
    <Text style={styles.title}>{item.title || 'No Title'}</Text>

    {item.location?.city && (
      <Text style={styles.locationText}>
        {item.location.district
          ? `${item.location.district}, ${item.location.city}`
          : item.location.city}
      </Text>
    )}
  </View>

  {/* Public/Private badge or Match Filters */}
  {showPublicPrivateBadge ? (
    <View
      style={[
        styles.matchBadge,
        { backgroundColor: item.isPublic ? '#6BCB77' : '#FF6B6B' },
      ]}
    >
      <Text style={styles.matchBadgeText}>
        {item.isPublic ? 'Public' : 'Private'}
      </Text>
    </View>
  ) : matchScore !== undefined && totalFilters !== undefined ? (
    <View style={[styles.matchBadge, { backgroundColor: '#DFF5D1' }]}>
      <Text style={[styles.matchBadgeText, { color: '#0F6B5B' }]}>
        Matched {matchScore} of {totalFilters} filters
      </Text>
    </View>
  ) : null}
</View>





      {/* ---------- Image + Save Icon ---------- */}
      {item.mainImage && (
        <View style={styles.imageWrapper}>
          {onToggleSave && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onToggleSave}
              hitSlop={10}
            >
              <Image
                source={isSaved ? saveIcons.saved : saveIcons.unsaved}
                style={styles.saveIcon}
              />
            </TouchableOpacity>
          )}

          <Image
            source={{ uri: item.mainImage }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* ---------- Price + Usage Icons ---------- */}
      <View style={styles.priceRow}>
        {item.price && (
          <Text style={styles.price}>
            ${parseFloat(item.price).toFixed(0)}{' '}
            {(item.priceFrequency ?? 'daily').charAt(0).toUpperCase() +
              (item.priceFrequency ?? 'daily').slice(1)}
          </Text>
        )}

        <View style={styles.iconRow}>
          {item.usageType?.map((type: string) =>
            iconsMap[type] ? (
              <Image
                key={type}
                source={iconsMap[type]}
                style={styles.icon}
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
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  title: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F6B5B',
  },

  locationText: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },

  matchBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 8,
  },

  matchBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#FFFFFF',
  },

  imageWrapper: {
    position: 'relative',
    width: '100%',
    marginTop: 10,
  },

  mainImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },

  saveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 6,
  },

  saveIcon: {
    width: 30,
    height: 30,
  },

  priceRow: {
    marginTop: 10,
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
  },

  icon: {
    width: 32,
    height: 32,
    marginLeft: 4,
  },
});


export default SpaceCard;
