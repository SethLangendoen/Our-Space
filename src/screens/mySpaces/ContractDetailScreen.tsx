

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

type ContractEntry = {
  userId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  state: 'requested' | 'accepted' | 'declined';
  requestedAt: Timestamp;
};

type UserData = {
  firstName: string;
  lastName: string;
  profileImage: string;
};

type PostData = {
  id: string;
  title?: string;
  description?: string;
  address?: string;
  contracts?: { [userId: string]: ContractEntry };
  // add any other fields from your post if you want
};

export default function ContractDetailScreen() {
  const route = useRoute();
  const { postId } = route.params as { postId: string };

  const [post, setPost] = useState<PostData | null>(null);
  const [contracts, setContracts] = useState<{ [key: string]: ContractEntry }>({});
  const [userDetails, setUserDetails] = useState<{ [key: string]: UserData }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostAndContracts = async () => {
      try {
        const docRef = doc(db, 'spaces', postId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          // Cast snapshot data to PostData so TS knows about contracts
          const postData = { id: snapshot.id, ...(snapshot.data() as Omit<PostData, 'id'>) };
          setPost(postData);

          const allContracts = postData.contracts || {};
          setContracts(allContracts);

          // Fetch each user's info
          const userMap: { [key: string]: UserData } = {};
          await Promise.all(
            Object.keys(allContracts).map(async (userId) => {
              const userRef = doc(db, 'users', userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                userMap[userId] = userSnap.data() as UserData;
              }
            })
          );
          setUserDetails(userMap);
        }
      } catch (error) {
        console.error('Error fetching contract data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndContracts();
  }, [postId]);

  const handleAccept = async (selectedUserId: string) => {
    if (!post?.id) return;

    try {
      const updatedContracts: { [key: string]: ContractEntry } = { ...contracts };

      // Update selected user to accepted, others to declined
      Object.keys(updatedContracts).forEach((userId) => {
        if (userId === selectedUserId) {
          updatedContracts[userId].state = 'accepted';
        } else if (updatedContracts[userId].state === 'requested') {
          updatedContracts[userId].state = 'declined';
        }
      });

      await updateDoc(doc(db, 'spaces', post.id), {
        contracts: updatedContracts,
      });

      setContracts(updatedContracts);
      Alert.alert('Accepted', 'Reservation accepted and others declined.');
    } catch (error) {
      console.error('Failed to accept contract:', error);
      Alert.alert('Error', 'Failed to update contracts.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#334E35" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text>Contract not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Contract Requests</Text>

      {Object.entries(contracts).length === 0 && (
        <Text>No reservation requests yet.</Text>
      )}

      {Object.entries(contracts).map(([userId, contract]) => {
        const user = userDetails[userId];
        return (
          <View key={userId} style={styles.contractCard}>
            {user?.profileImage && (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.dateRange}>
                {contract.startDate?.toDate().toDateString() || 'Start'} → {contract.endDate?.toDate().toDateString() || 'End'}
              </Text>
              <Text style={[styles.status, { color: contract.state === 'accepted' ? '#32CD32' : contract.state === 'declined' ? '#FF6347' : '#555' }]}>
                Status: {contract.state}
              </Text>
            </View>

            {contract.state === 'requested' && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(userId)}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFCF1', // Wheat/Cream Background
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0F6B5B', // Emerald Green for headlines
  },

  contractCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF', // white card
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc',
  },

  name: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1F1F1F',
  },

  dateRange: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginVertical: 2,
  },

  status: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#629447', // Earthy Green for friendly status label
  },

  acceptButton: {
    backgroundColor: '#0F6B5B', // Emerald Green CTA
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 'auto',
  },

  buttonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
});
