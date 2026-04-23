



import { RowStyle } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
// import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useFilterContext } from 'src/context/FilterContext';

// import { Image } from 'expo-image';

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

// interface SpaceCardProps {
//   item: any;
//   onPress: () => void;

//   isSaved?: boolean;
//   onToggleSave?: () => void;

//   matchScore?: number;
//   totalFilters?: number;
//   showPublicPrivateBadge?: boolean;
// }
interface SpaceCardProps {
  item: any;
  onPress?: () => void;             // navigate to detail view
  onEditPress?: () => void;         // navigate to edit screen
  isSaved?: boolean;
  onToggleSave?: () => void;
  matchScore?: number;
  totalFilters?: number;
  showPublicPrivateBadge?: boolean;
  showEditButton?: boolean;         // NEW: show edit button
}

interface PriceData {
  amount: string;
  isPublic: boolean;
  enabled: boolean;
}




const SpaceCard = ({
  item,
  onPress,
  onEditPress,
  isSaved,
  onToggleSave,
  matchScore,
  totalFilters,
  showPublicPrivateBadge,
  showEditButton = false,
}: SpaceCardProps) => {


const publicPriceEntry = item.prices
  ? (Object.entries(item.prices) as [string, PriceData][]).find(
      ([_, data]) => data.isPublic
    )
  : null;

const publicPrice = publicPriceEntry
  ? { period: publicPriceEntry[0], amount: publicPriceEntry[1].amount }
  : null;


  // Compute match label and colors
let matchLabel: string | null = null;
let matchBgColor = '#DFF5D1';
let matchTextColor = '#0F6B5B';

if (matchScore !== undefined && totalFilters !== undefined && totalFilters > 0) {
  const matchPercent = (matchScore / totalFilters) * 100;

  if (matchPercent === 100) {
    matchLabel = 'Perfect Match';
    matchBgColor = '#4CAF50';
    matchTextColor = '#FFFFFF';
  } else if (matchPercent >= 70) {
    matchLabel = 'Great Match';
    matchBgColor = '#A3D977';
    matchTextColor = '#0F6B5B';
  } else if (matchPercent >= 50) {
    matchLabel = 'Good Match';
    matchBgColor = '#DFF5D1';
    matchTextColor = '#0F6B5B';
  } else if (matchPercent >= 30) {
    matchLabel = 'Fair Match';
    matchBgColor = '#FFF3B0';
    matchTextColor = '#8A6D1E';
  } 
}



  const validPrices = item.prices
  ? (Object.values(item.prices) as PriceData[]).filter(
      (price) => price.isPublic && price.amount
    )
  : [];

  const hasMultiplePrices = validPrices.length > 1;

return (

  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.9}
    onPress={onPress}  // <-- anywhere else navigates to detail
  >
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
      ) : matchLabel ? (
        <View style={[styles.matchBadge, { backgroundColor: matchBgColor }]}>
          <Text style={[styles.matchBadgeText, { color: matchTextColor }]}>
            {matchLabel}
          </Text>
        </View>
      ) : null}

      {showEditButton && onEditPress && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={(e) => {
            e.stopPropagation();  // 🔑 Prevent card press from firing
            onEditPress();
          }}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
      )}

      {onToggleSave && (
        <TouchableOpacity
          style={styles.topRightSaveButton}
          onPress={(e) => {
            e.stopPropagation(); // prevent card press
            onToggleSave();
          }}
          hitSlop={10}
        >
          <Image
            source={isSaved ? saveIcons.saved : saveIcons.unsaved}
            style={styles.saveIcon}
          />
        </TouchableOpacity>
      )}
    </View>

    {/* ---------- Image + Price + Icons ---------- */}
    {item.mainImage && (
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.mainImage }}
          style={styles.mainImage}
        />
      </View>
    )}



    <View style={styles.priceCol}>
    {publicPrice && publicPrice.amount && (
    <View style={styles.priceRow}>

    <Text style={styles.price}>
      ${parseFloat(publicPrice.amount).toFixed(0)} /{' '}
      {(() => {
        const periodMap: Record<'daily' | 'weekly' | 'monthly', string> = {
          daily: 'day',
          weekly: 'week',
          monthly: 'month',
        };

        return periodMap[publicPrice.period as keyof typeof periodMap];
      })()}
    </Text>

    <View style={styles.verified}>

      <Text style={styles.verifiedText}>Verified Host</Text>
      <Image
        source={require('../../assets/badges/complete/verifiedBadge.png')}
        style={styles.verifiedIconSmall}
      />
    </View>

  </View>
)}

    {item.prices &&
      (Object.values(item.prices) as PriceData[]).filter(
        (price) => price.enabled && price.amount
      ).length > 1 && (
        <Text style={styles.morePricingText}>
          Other pricing options available
        </Text>
    )}

    <Text style={styles.suitableText}>Suitable For:</Text>
    <View style={styles.iconRow}>
      {item.usageType?.map((type: string) =>
        iconsMap[type] ? (
          <View key={type} style={styles.iconItem}>
            <Image source={iconsMap[type]} style={styles.icon} />
            <Text style={styles.iconLabel}>{type}</Text>
          </View>
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
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0F6B5B',
    borderRadius: 8,
    marginLeft: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  title: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: 'Poppins-Bold',
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
    fontSize: 14,
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
    top: 4,
    right: 4,
    zIndex: 10,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
  },

  saveIcon: {
    width: 20,
    height: 20,
  },
  morePricingText: {
  fontSize: 12,
  color: '#777',
  fontFamily: 'Poppins-Regular',
  marginTop: 2,
},
otherPrices: {
  display: 'flex',
  flexDirection: 'column' 
},
iconItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 0,
  marginRight: 10,
},
suitableText: {
  color: '#000',
  fontWeight: '600',
  fontFamily: 'Poppins-Regular',
  marginTop: 8,
},
iconLabel: {
  fontSize: 12,
  marginLeft: 0,
  color: '#333',
  fontFamily: 'Poppins-Regular',
},
  priceRow: {
    marginTop: 10,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
  },
  priceCol: {
    marginTop: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  price: {
    fontWeight: 600,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#0F6B5B',
  },

  
  verifiedIconSmall: {
    width: 20,
    height: 20,
    marginLeft: 6,
    marginRight: 4,
  },
  
  ratingText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },

  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  icon: {
    width: 32,
    height: 32,
    marginLeft: 0,
  },
  topRightSaveButton: {
    position: 'relative',
    top: -4,
    right: -4,
    zIndex: 10,
    padding: 6,
    backgroundColor: 'transparent',
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F3EC',
    paddingVertical: 2,
    marginTop: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
  },
  
  verifiedText: {
    fontSize: 12,
    fontWeight: 700,
    color: '#13ad58',
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  
  
  
});


export default SpaceCard;
