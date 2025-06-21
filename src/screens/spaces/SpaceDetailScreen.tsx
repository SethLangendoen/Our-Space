import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

type RootStackParamList = {
  Spaces: undefined;
  Filters: undefined;
  SpaceDetail: { spaceId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'SpaceDetail'>;

export default function SpaceDetailScreen({ route, navigation }: Props) {
  const { spaceId } = route.params;
  const [space, setSpace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const docRef = doc(db, 'spaces', spaceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSpace(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching space:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpace();
  }, [spaceId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!space) {
    return (
      <View style={styles.center}>
        <Text>Space not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{space.title}</Text>
      <Text style={styles.description}>{space.description}</Text>
      {/* Add more details as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  description: { fontSize: 16, marginTop: 12 },
});
