

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

type RootStackParamList = {
  MySpacesScreen: undefined;
  CreateSpaceScreen: undefined;
  EditSpaceScreen: { spaceId: string };
};

type MySpacesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MySpacesScreen'
>;

export default function MySpacesScreen() {
  const navigation = useNavigation<MySpacesScreenNavigationProp>();
  const [selectedTab, setSelectedTab] = useState<'Awaiting' | 'Ongoing' >('Ongoing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
        setUserPosts([]);
      }
    });
    return unsubscribe;
  }, []);

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

  useEffect(() => {
    fetchUserPosts();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchUserPosts();
    }, [userId])
  );

  const renderContent = () => {
    const filteredPosts = userPosts; // Add filtering logic later if needed
    switch (selectedTab) {
      case 'Awaiting':
        return filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              onPress={() =>
                navigation.navigate('EditSpaceScreen', { spaceId: post.id })
              }
              style={styles.postBox}
            >
              <View style={styles.postHeader}>
                <Text style={styles.postTitle}>{post.title}</Text>
                {post.postType && (
                  <View
                    style={[
                      styles.tag,
                      post.postType === 'Offering'
                        ? styles.offeringTag
                        : styles.requestingTag,
                    ]}
                  >
                    <Text style={styles.tagText}>{post.postType}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.postDesc}>{post.description}</Text>
              <View style={styles.postFooter}>
                <Text style={styles.postDate}>
                  {post.availability?.startDate} → {post.availability?.endDate}
                </Text>
                {post.price && (
                  <Text style={styles.priceText}>${post.price}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
			<View style={styles.placeholderImage}>
			<Text style={styles.message}>Spaces you create will show up here</Text>
			<Image
				source={require('../../../assets/mySpaces/awaitingPosts.png')}
				style={styles.awaitingImage}
				resizeMode="contain"
			/>
			</View>

        );


      default:
        return (
			<View style={styles.placeholderImage}>
		<Text style={styles.message}>Ongoing Space Contracts will show up here </Text>
		<Image
		source={require('../../../assets/mySpaces/ongoingContract.png')}
		style={styles.awaitingImage}
		resizeMode="contain"
		/>
			</View>

		)
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {['Awaiting', 'Ongoing'].map((tab) => (
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

      <View style={styles.content}>{renderContent()}</View>

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
  container: { flex: 1, padding: 16 },
  tabContainer: {
	flexDirection: 'row',
	width: '100%',
  },
  
  tabButton: {
	flex: 1,                     
	alignItems: 'center',  
	paddingVertical: 12,
	backgroundColor: '#eee',
	borderBottomWidth: 2,
	borderColor: 'transparent',
	borderRadius: 5,
	margin: 5
  },
  


  activeTabButton: {
    backgroundColor: '#000',
  },
  tabText: {
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  postBox: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDesc: {
    marginVertical: 6,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postDate: {
    color: '#666',
  },
  priceText: {
    fontWeight: 'bold',
  },
  tag: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offeringTag: {
    backgroundColor: '#d1e7dd',
  },
  requestingTag: {
    backgroundColor: '#f8d7da',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginTop: 100,
	marginBottom: 40,
    fontStyle: 'italic',
    color: '#999',
  },
  createButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  awaitingImage: {
    width: 200,
    height: 200,
    opacity: 0.9,
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});

