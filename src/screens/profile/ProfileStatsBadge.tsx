import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProfileStatsBadgeProps {
  reviews: { rating: number }[];
  reservations: {
    startDate: any;
    endDate: any | null;
    status: string;
    completed?: boolean;
  }[];
  avgResponseMs: number | null;
}

const ProfileStatsBadge: React.FC<ProfileStatsBadgeProps> = ({
  reviews,
  reservations,
  avgResponseMs,
}) => {
  // ⭐ Average Rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  // 🧱 Total Space Hours
  const totalSpaceHours = reservations.reduce((total, r) => {
    if (!r.startDate) return total;
    if (!['confirmed', 'completed'].includes(r.status)) return total;

    const start = r.startDate.toDate();
    const end = r.endDate ? r.endDate.toDate() : new Date();
    const hours = Math.max(0, (end.getTime() - start.getTime()) / 36e5);

    return total + hours;
  }, 0);

  // ⏱ Response Time Formatter
  const formatResponseTime = (ms: number) => {
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.round(minutes / 60);
    return `${hours} hr`;
  };

  return (
    <View style={styles.container}>
      <Stat label="Avg Rating" value={averageRating ? averageRating.toFixed(1) : '—'} />
      <Stat
        label="Response Time"
        value={avgResponseMs ? formatResponseTime(avgResponseMs) : '—'}
      />
      <Stat
        label="Space Hours"
        value={Math.round(totalSpaceHours).toLocaleString()}
      />
    </View>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.stat}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default ProfileStatsBadge;
