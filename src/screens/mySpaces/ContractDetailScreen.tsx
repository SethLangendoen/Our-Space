// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../../firebase/config';

// export default function ContractDetailScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { postId } = route.params as { postId: string };

//   const [post, setPost] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPost = async () => {
//       try {
//         const docRef = doc(db, 'spaces', postId);
//         const snapshot = await getDoc(docRef);
//         if (snapshot.exists()) {
//           setPost({ id: snapshot.id, ...snapshot.data() });
//         }
//       } catch (error) {
//         console.error('Error fetching contract:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPost();
//   }, [postId]);

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#334E35" />
//       </View>
//     );
//   }

//   if (!post) {
//     return (
//       <View style={styles.centered}>
//         <Text>Contract not found.</Text>
//       </View>
//     );
//   }

//   const contract = post.contract;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Contract Details</Text>

//       <Text style={styles.label}>Title:</Text>
//       <Text style={styles.value}>{post.title}</Text>

//       <Text style={styles.label}>Description:</Text>
//       <Text style={styles.value}>{post.description}</Text>

//       <Text style={styles.label}>Location:</Text>
//       <Text style={styles.value}>{post.address}</Text>

//       <Text style={styles.label}>Contract Status:</Text>
//       <Text style={[styles.value, styles.status]}>
//         {contract?.state ?? 'No status'}
//       </Text>

//       <Text style={styles.label}>Requested On:</Text>
//       <Text style={styles.value}>
//         {contract?.requestedAt?.toDate
//           ? contract.requestedAt.toDate().toDateString()
//           : 'N/A'}
//       </Text>

//       <Text style={styles.label}>Renter ID:</Text>
//       <Text style={styles.value}>{contract?.renterId || 'N/A'}</Text>

//       <Text style={styles.label}>Notes:</Text>
//       <Text style={styles.value}>{contract?.notes || 'No additional notes.'}</Text>

//       {/* Placeholder buttons for future features */}
//       <View style={styles.buttonRow}>
//         {contract?.state === 'requested' && (
//           <>
//             <TouchableOpacity style={[styles.button, { backgroundColor: '#00BFFF' }]}>
//               <Text style={styles.buttonText}>Accept</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.button, { backgroundColor: '#FF6347' }]}>
//               <Text style={styles.buttonText}>Decline</Text>
//             </TouchableOpacity>
//           </>
//         )}
//         {contract?.state === 'accepted' && (
//           <TouchableOpacity style={[styles.button, { backgroundColor: '#32CD32' }]}>
//             <Text style={styles.buttonText}>Confirm</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </ScrollView>
//   );
// }



// const styles = StyleSheet.create({
// 	container: {
// 	  padding: 20,
// 	  backgroundColor: '#fff',
// 	},
// 	centered: {
// 	  flex: 1,
// 	  justifyContent: 'center',
// 	  alignItems: 'center',
// 	},
// 	title: {
// 	  fontSize: 22,
// 	  fontWeight: 'bold',
// 	  marginBottom: 20,
// 	  textAlign: 'center',
// 	  color: '#334E35',
// 	},
// 	label: {
// 	  fontWeight: '600',
// 	  marginTop: 10,
// 	  color: '#555',
// 	},
// 	value: {
// 	  fontSize: 16,
// 	  marginTop: 4,
// 	  marginBottom: 8,
// 	  color: '#333',
// 	},
// 	status: {
// 	  textTransform: 'capitalize',
// 	  fontWeight: 'bold',
// 	  color: '#444',
// 	},
// 	buttonRow: {
// 	  flexDirection: 'row',
// 	  marginTop: 20,
// 	  justifyContent: 'space-around',
// 	},
// 	button: {
// 	  paddingVertical: 12,
// 	  paddingHorizontal: 24,
// 	  borderRadius: 8,
// 	},
// 	buttonText: {
// 	  color: '#fff',
// 	  fontWeight: '600',
// 	},
//   });
  


// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
// import { useRoute } from '@react-navigation/native';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { db } from '../../firebase/config';

// type ContractEntry = {
//   userId: string;
//   startDate: any;
//   endDate: any;
//   state: string;
//   requestedAt: any;
// };

// type UserData = {
//   firstName: string;
//   lastName: string;
//   profileImage: string;
// };



// type ContractEntry = {
// 	userId: string;
// 	startDate: Timestamp;
// 	endDate: Timestamp;
// 	state: 'requested' | 'accepted' | 'declined';
// 	requestedAt: Timestamp;
//   };
  
//   type UserData = {
// 	firstName: string;
// 	lastName: string;
// 	profileImage: string;
//   };
  
//   type PostData = {
// 	id: string;
// 	title?: string;
// 	description?: string;
// 	address?: string;
// 	contracts?: { [userId: string]: ContractEntry };
// 	// add any other fields from your post if you want
//   };


// export default function ContractDetailScreen() {
//   const route = useRoute();
//   const { postId } = route.params as { postId: string };

//   const [post, setPost] = useState<any>(null);
//   const [contracts, setContracts] = useState<{ [key: string]: ContractEntry }>({});
//   const [userDetails, setUserDetails] = useState<{ [key: string]: UserData }>({});
//   const [loading, setLoading] = useState(true);



//   useEffect(() => {
//     const fetchPostAndContracts = async () => {
//       try {
//         const docRef = doc(db, 'spaces', postId);
//         const snapshot = await getDoc(docRef);
//         if (snapshot.exists()) {
//           const postData = { id: snapshot.id, ...snapshot.data() };
//           setPost(postData);

//           const allContracts = postData.contracts || {};
//           setContracts(allContracts);

//           // Fetch each user's info
//           const userMap: { [key: string]: UserData } = {};
//           await Promise.all(
//             Object.keys(allContracts).map(async (userId) => {
//               const userRef = doc(db, 'users', userId);
//               const userSnap = await getDoc(userRef);
//               if (userSnap.exists()) {
//                 userMap[userId] = userSnap.data() as UserData;
//               }
//             })
//           );
//           setUserDetails(userMap);
//         }
//       } catch (error) {
//         console.error('Error fetching contract data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPostAndContracts();
//   }, [postId]);

//   const handleAccept = async (selectedUserId: string) => {
//     if (!post?.id) return;

//     try {
//       const updatedContracts: { [key: string]: ContractEntry } = { ...contracts };

//       // Update selected user to accepted, others to declined
//       Object.keys(updatedContracts).forEach((userId) => {
//         if (userId === selectedUserId) {
//           updatedContracts[userId].state = 'accepted';
//         } else if (updatedContracts[userId].state === 'requested') {
//           updatedContracts[userId].state = 'declined';
//         }
//       });

//       await updateDoc(doc(db, 'spaces', post.id), {
//         contracts: updatedContracts,
//       });

//       setContracts(updatedContracts);
//       Alert.alert('Accepted', 'Reservation accepted and others declined.');
//     } catch (error) {
//       console.error('Failed to accept contract:', error);
//       Alert.alert('Error', 'Failed to update contracts.');
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#334E35" />
//       </View>
//     );
//   }

//   if (!post) {
//     return (
//       <View style={styles.centered}>
//         <Text>Contract not found.</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>Contract Requests</Text>

//       {Object.entries(contracts).length === 0 && (
//         <Text>No reservation requests yet.</Text>
//       )}

//       {Object.entries(contracts).map(([userId, contract]) => {
//         const user = userDetails[userId];
//         return (
//           <View key={userId} style={styles.contractCard}>
//             {user?.profileImage && (
//               <Image source={{ uri: user.profileImage }} style={styles.avatar} />
//             )}
//             <View style={{ flex: 1 }}>
//               <Text style={styles.name}>
//                 {user?.firstName} {user?.lastName}
//               </Text>
//               <Text style={styles.dateRange}>
//                 {contract.startDate?.toDate?.().toDateString?.() || 'Start'} → {contract.endDate?.toDate?.().toDateString?.() || 'End'}
//               </Text>
//               <Text style={[styles.status, { color: contract.state === 'accepted' ? '#32CD32' : contract.state === 'declined' ? '#FF6347' : '#555' }]}>
//                 Status: {contract.state}
//               </Text>
//             </View>

//             {contract.state === 'requested' && (
//               <TouchableOpacity
//                 style={styles.acceptButton}
//                 onPress={() => handleAccept(userId)}
//               >
//                 <Text style={styles.buttonText}>Accept</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         );
//       })}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#334E35',
//   },
//   contractCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 10,
//     borderBottomWidth: 1,
//     borderColor: '#eee',
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     marginRight: 12,
//   },
//   name: {
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   dateRange: {
//     fontSize: 14,
//     color: '#666',
//     marginVertical: 2,
//   },
//   status: {
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   acceptButton: {
//     backgroundColor: '#00BFFF',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 6,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });



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
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#334E35',
  },
  contractCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateRange: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#00BFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
