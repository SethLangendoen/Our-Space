

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type ReservationCardProps = {
  reservation: any;
  isOwner: boolean;
  onPress: () => void;
};

const getStorageStatusText = (reservation: any) => {
  if (reservation.status !== 'confirmed') return null;

  const now = new Date();
  const start = reservation.startDate?.toDate
    ? reservation.startDate.toDate()
    : reservation.startDate
    ? new Date(reservation.startDate)
    : null;

  const end = reservation.endDate?.toDate
    ? reservation.endDate.toDate()
    : reservation.endDate
    ? new Date(reservation.endDate)
    : null;

  if (!start) return null;

  const msPerDay = 1000 * 60 * 60 * 24;

  // 1️⃣ Not started yet
  if (now < start) {
    const days = Math.ceil((start.getTime() - now.getTime()) / msPerDay);
    return `Starts in ${days} day${days === 1 ? '' : 's'}`;
  }

  // 2️⃣ Started, no end date
  if (!end) {
    return 'Actively ongoing · No set end date';
  }

  // 3️⃣ Started, has end date
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / msPerDay);

  if (daysLeft > 0) {
    return `Ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
  }

  return 'Storage period ended';
};


export default function ReservationCard({ reservation, isOwner, onPress }: ReservationCardProps) {
  const otherUser = isOwner ? reservation.requester : reservation.owner;
  const space = reservation.space;

  // ✅ compute per-card, using the actual reservation
  const statusText = getStorageStatusText(reservation);

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

          {reservation.status === 'confirmed' && statusText && (
            <Text style={styles.dateStatusText}>{statusText}</Text>
          )}
        </View>

        <View
          style={[
            styles.statusBadge,
            reservation.status === 'requested'
              ? styles.requestedBadge
              : styles.confirmedBadge,
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
  dateStatusText: {
    marginTop: 4,
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
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
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  spaceTitle: {
    fontSize: 16,
    color: 'green',
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
