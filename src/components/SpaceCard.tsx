

import React from 'react';
// import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

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

    <View style={styles.priceRow}>
      {publicPrice && publicPrice.amount && (
        <Text style={styles.price}>
          ${parseFloat(publicPrice.amount).toFixed(0)}{' '}
          {publicPrice.period.charAt(0).toUpperCase() + publicPrice.period.slice(1)}
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



//   return (
//     <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>

      
// <View style={styles.titleRow}>
//   <View style={{ flex: 1 }}>
//     <Text style={styles.title}>{item.title || 'No Title'}</Text>

//     {item.location?.city && (
//       <Text style={styles.locationText}>
//         {item.location.district
//           ? `${item.location.district}, ${item.location.city}`
//           : item.location.city}
//       </Text>
//     )}
//   </View>

//   {/* Right side: Public/Private badge OR Match Filters */}
//   {/* {showPublicPrivateBadge ? (
//     <View style={[styles.matchBadge, { backgroundColor: item.isPublic ? '#6BCB77' : '#FF6B6B' }]}>
//       <Text style={styles.matchBadgeText}>{item.isPublic ? 'Public' : 'Private'}</Text>
//     </View>
//   ) : matchScore !== undefined && totalFilters !== undefined ? (
//     <View style={[styles.matchBadge, { backgroundColor: '#DFF5D1' }]}>
//       <Text style={[styles.matchBadgeText, { color: '#0F6B5B' }]}>
//         Matched {matchScore} of {totalFilters} filters
//       </Text>
//     </View>
//   ) : null} */}
// {showPublicPrivateBadge ? (
//   <View
//     style={[
//       styles.matchBadge,
//       { backgroundColor: item.isPublic ? '#6BCB77' : '#FF6B6B' },
//     ]}
//   >
//     <Text style={styles.matchBadgeText}>
//       {item.isPublic ? 'Public' : 'Private'}
//     </Text>
//   </View>
// ) : matchLabel ? (
//   <View style={[styles.matchBadge, { backgroundColor: matchBgColor }]}>
//     <Text style={[styles.matchBadgeText, { color: matchTextColor }]}>
//       {matchLabel}
//     </Text>
//   </View>
// ) : null}


//   {onToggleSave && (
//     <TouchableOpacity
//       style={styles.topRightSaveButton}
//       onPress={onToggleSave}
//       hitSlop={10}
//     >
//       <Image
//         source={isSaved ? saveIcons.saved : saveIcons.unsaved}
//         style={styles.saveIcon}
//       />
//     </TouchableOpacity>
//   )}
// </View>






//       {/* ---------- Image + Save Icon ---------- */}
//       {item.mainImage && (
//         <View style={styles.imageWrapper}>

//           {/* <Image
//             source={{ uri: item.mainImage }}
//             style={styles.mainImage}
//             resizeMode="cover"
//           /> */}

//           <Image
//             source={{ uri: item.mainImage }}
//             style={styles.mainImage}
//             // contentFit="cover" // keeps aspect ratio, fills container
//             // placeholder={require('../../assets/badges/complete/firstHost.png')}
//             // cachePolicy="memory-disk" // caching
//           />

//         </View>


//       )}

//       {/* ---------- Price + Usage Icons ---------- */}
//       <View style={styles.priceRow}>
//         {publicPrice && publicPrice.amount && (
//           <Text style={styles.price}>
//             ${parseFloat(publicPrice.amount).toFixed(0)}{' '}
//             {publicPrice.period.charAt(0).toUpperCase() + publicPrice.period.slice(1)}
//           </Text>
//         )}


//         <View style={styles.iconRow}>
//           {item.usageType?.map((type: string) =>
//             iconsMap[type] ? (
//               <Image
//                 key={type}
//                 source={iconsMap[type]}
//                 style={styles.icon}
//               />
//             ) : null
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );


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
    fontFamily: 'Poppins-Medium',
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
  topRightSaveButton: {
    position: 'relative',
    top: -4,
    right: -4,
    zIndex: 10,
    padding: 6,
    backgroundColor: 'transparent',
  },
  
});


export default SpaceCard;
