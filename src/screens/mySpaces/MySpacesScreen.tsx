import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


type RootStackParamList = {
	MySpacesScreen: undefined;
	CreateSpaceScreen: undefined;
  };

  type MySpacesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MySpacesScreen'
>;
  

export default function MySpacesScreen() {
  const navigation = useNavigation<MySpacesScreenNavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'Awaiting' | 'Ongoing' | 'Favourited'>('Ongoing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  
  useEffect(() => {
	const unsubscribe = onAuthStateChanged(auth, async (user) => {
	  if (user) {
		setIsLoggedIn(true);
		setUserId(user.uid);
	  } else {
		setIsLoggedIn(false);
		setUserId(null);
		setUserPosts([]); // Clear if logged out
	  }
	});
  
	return unsubscribe;
  }, []);
  
  useEffect(() => {
	const fetchUserPosts = async () => {
	  if (!userId) return;
  
	  try {
		const q = query(collection(db, 'spaces'), where('userId', '==', userId));
		const querySnapshot = await getDocs(q);
		const posts = querySnapshot.docs.map((doc) => ({
		  id: doc.id,
		  ...doc.data(),
		}));
		setUserPosts(posts);
	  } catch (error) {
		console.error('Error fetching user posts:', error);
	  }
	};
  
	fetchUserPosts();
  }, [userId]);

  useFocusEffect(
	useCallback(() => {
	  const fetchUserPosts = async () => {
		if (!userId) return;
  
		try {
		  const q = query(collection(db, 'spaces'), where('userId', '==', userId));
		  const querySnapshot = await getDocs(q);
		  const posts = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		  }));
		  setUserPosts(posts);
		} catch (error) {
		  console.error('Error fetching user posts:', error);
		}
	  };
  
	  fetchUserPosts();
	}, [userId])
  );
  
  
  const renderContent = () => {
    switch (selectedTab) {
		case 'Awaiting':
			return userPosts.length > 0 ? (
			  userPosts.map((post) => (
<View key={post.id} style={styles.postBox}>
  <View style={styles.postHeader}>
    <Text style={styles.postTitle}>{post.title}</Text>
    {post.postType && (
      <View style={[
        styles.tag,
        post.postType === 'Offering' ? styles.offeringTag : styles.requestingTag,
      ]}>
        <Text style={styles.tagText}>{post.postType}</Text>
      </View>
    )}
  </View>

  <Text style={styles.postDesc}>{post.description}</Text>

  <View style={styles.postFooter}>
    <Text style={styles.postDate}>
      {post.startDate} → {post.endDate}
    </Text>
    {post.price && (
      <Text style={styles.priceText}>${post.price}</Text>
    )}
  </View>
</View>

			  ))
			) : (
			  <Text style={styles.message}>No awaiting posts</Text>
			);
		  
      case 'Favourited':
        return <Text style={styles.message}>No favourited posts</Text>;
      default:
        return <Text style={styles.message}>No ongoing posts</Text>;
    }
  };


  useEffect(() => {
	const unsubscribe = onAuthStateChanged(auth, (user) => {
	  setIsLoggedIn(!!user);
	});
  
	return unsubscribe;
  }, []);
  


  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {['Awaiting', 'Ongoing', 'Favourited'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setSelectedTab(tab as typeof selectedTab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

	  <TouchableOpacity
  style={[
    styles.createButton,
    !isLoggedIn && { backgroundColor: '#aaa' },
  ]}
  onPress={() => {
    if (isLoggedIn) {
      navigation.navigate('CreateSpaceScreen');
    } else {
      alert('Please log in to create a post.');
    }
  }}
  disabled={!isLoggedIn}
>
  <Text style={styles.createButtonText}>Create Post</Text>
</TouchableOpacity>

    </View>
  );
}
const styles = StyleSheet.create({
	container: {
	  flex: 1,
	  paddingTop: 30,
	  paddingHorizontal: 5,
	  justifyContent: 'space-between',
	},
	tabContainer: {
	  flexDirection: 'row',
	  justifyContent: 'space-around',
	  marginBottom: 20,
	},
	tabButton: {
	  paddingVertical: 10,
	  paddingHorizontal: 20,
	  borderRadius: 8,
	  borderWidth: 1,
	  borderColor: '#7b7b7b',
	  backgroundColor: 'transparent',
	},
	activeTabButton: {
	  backgroundColor: '#7b7b7b',
	},
	tabText: {
	  color: '#7b7b7b',
	  fontWeight: '500',
	},
	activeTabText: {
	  color: '#fff',
	},
	content: {
	  alignItems: 'center',
	  justifyContent: 'center',
	  flex: 1,
	},
	message: {
	  fontSize: 18,
	  color: '#666',
	},
	createButton: {
	  backgroundColor: '#000',
	  paddingVertical: 15,
	  borderRadius: 6,
	  alignItems: 'center',
	  marginBottom: 30,
	},
	createButtonText: {
	  color: '#fff',
	  fontSize: 16,
	  fontWeight: 'bold',
	},
	postBox: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 10,
		padding: 15,
		marginVertical: 10,
		backgroundColor: '#f9f9f9',
		width: '90%',
		alignSelf: 'center',
	  },
	  postTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5,
	  },
	  postDesc: {
		fontSize: 14,
		color: '#444',
		marginBottom: 5,
	  },
	  postDate: {
		fontSize: 12,
		color: '#888',
	  },
	  postHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 6,
	  },
	  tag: {
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 12,
	  },
	  offeringTag: {
		backgroundColor: '#28a745', // green
	  },
	  requestingTag: {
		backgroundColor: '#dc3545', // red
	  },
	  tagText: {
		color: 'white',
		fontWeight: '600',
		fontSize: 12,
	  },
	  postFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 10,
	  },
	  priceText: {
		fontWeight: 'bold',
		fontSize: 16,
		color: '#007bff', // blue
	  },
	  
  });
  
