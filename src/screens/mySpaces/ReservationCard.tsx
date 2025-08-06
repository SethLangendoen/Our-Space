






import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type ReservationCardProps = {
  reservation: any;
  isOwner: boolean;
  onPress: () => void;
};

export default function ReservationCard({ reservation, isOwner, onPress }: ReservationCardProps) {
  // Determine the "other" user (the one who is not the current user)
  const otherUser = isOwner ? reservation.requester : reservation.owner;
  // The space info
  const space = reservation.space;

  return (


    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        <Image
          source={{ uri: otherUser.photoUrl || 'https://placekitten.com/80/80' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{otherUser.name || 'Unknown User'}</Text>
        </View>
      </View>




      <View style={styles.right}>
		<View style={styles.spaceTitleContainer}>
			<Text style={styles.spaceTitle}>{space?.title || 'Untitled'}</Text>
		</View>
		<View style={styles.imageWrapper}>


        {space?.mainImage ? (
          <Image source={{ uri: space.mainImage }} style={styles.spaceImage} />
        ) : (
          <View style={[styles.spaceImage, styles.spaceImagePlaceholder]}>
            <Text style={{ color: '#aaa' }}>No Image</Text>
          </View>
        )}

		</View>


		
        <View
          style={[
            styles.statusBadge,
            reservation.status === 'requested' ? styles.requestedBadge : styles.confirmedBadge,
          ]}
        >
          <Text style={styles.statusText}>{reservation.status.toUpperCase()}</Text>
        </View>
      </View>

	  
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ddd',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
  },
  right: {
    alignItems: 'center',
    maxWidth: 140,
  },
  spaceImage: {
    width: 100,
    height: 70,
    borderRadius: 8,
    marginBottom: 6,
  },
  spaceImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  imageWrapper: {
	width: 100,
	height: 70,
	borderRadius: 8,
	overflow: 'hidden',
	position: 'relative',
	marginBottom: 6,
	justifyContent: 'flex-start',
  },
  
  spaceTitleContainer: {
	position: 'absolute',
	top: -14, // Pull it upward to overlap 50% of its own height (assumes ~28px total height)
	left: 6,
	zIndex: 10,
	backgroundColor: '#27ae60',
	borderRadius: 12,
	paddingHorizontal: 8,
	paddingVertical: 4,
  },
  
  spaceTitle: {
	fontSize: 12,
	color: 'white',
	fontWeight: '600',
  },
  
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  requestedBadge: {
    backgroundColor: '#f39c12', // orange
  },
  confirmedBadge: {
    backgroundColor: '#27ae60', // green
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
