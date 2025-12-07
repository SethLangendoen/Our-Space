

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type ReservationCardProps = {
  reservation: any;
  isOwner: boolean;
  onPress: () => void;
};

export default function ReservationCard({ reservation, isOwner, onPress }: ReservationCardProps) {
  const otherUser = isOwner ? reservation.requester : reservation.owner;
  const space = reservation.space;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      
      {/* Top: User Info */}
      <View style={styles.userRow}>
        <Image
          source={{ uri: otherUser.photoUrl || 'https://placekitten.com/80/80' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{otherUser.name || 'Unknown User'}</Text>
      </View>

      {/* Middle: Space Image */}
      {space?.mainImage ? (
        <Image source={{ uri: space.mainImage }} style={styles.spaceImage} />
      ) : (
        <View style={[styles.spaceImage, styles.spaceImagePlaceholder]}>
          <Text style={{ color: '#aaa' }}>No Image</Text>
        </View>
      )}

      {/* Bottom: Tags */}
      <View style={styles.tagsRow}>
        <View style={styles.spaceTitleContainer}>
          <Text style={styles.spaceTitle}>{space?.title || 'Untitled'}</Text>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
  },
  spaceImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  spaceImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spaceTitleContainer: {
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
