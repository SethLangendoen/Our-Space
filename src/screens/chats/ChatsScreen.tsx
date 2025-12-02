



import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

interface Chat {
  id: string;
  users: string[];
  lastMessage?: string;
  updatedAt?: any;
}

interface User {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export default function ChatsScreen() {
  const navigation = useNavigation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userDataMap, setUserDataMap] = useState<{ [key: string]: User }>({});

  const fetchUserById = async (userId: string) => {
    if (userDataMap[userId]) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserDataMap((prev) => ({
          ...prev,
          [userId]: userDoc.data() as User,
        }));
      }
    } catch (error) {
      console.warn('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user.uid);

        const q = query(
          collection(db, 'chats'),
          where('users', 'array-contains', user.uid)
        );

        const unsubscribeChats = onSnapshot(q, (snapshot) => {
          const chatsData: Chat[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Chat, 'id'>),
          }));

          setChats(chatsData);
          setLoading(false);

          chatsData.forEach((chat) => {
            const otherUserId = chat.users.find((u) => u !== user.uid);
            if (otherUserId) fetchUserById(otherUserId);
          });
        });

        return () => unsubscribeChats();
      } else {
        setCurrentUser(null);
        setLoading(false);
        setChats([]);
        setUserDataMap({});
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const renderChat = ({ item }: { item: Chat }) => {
    const otherUserId = item.users.find((u) => u !== currentUser) || '';
    const user = userDataMap[otherUserId];

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate('MessagesScreen' as never, {
            chatId: item.id,
            otherUser: otherUserId,
          } as never)
        }
      >
        <View style={styles.userRow}>
          <Image
            source={
              user?.profileImage
                ? { uri: user.profileImage }
                : require('../../../assets/blankProfile.png')
            }
            style={styles.userImage}
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>
              {user
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : 'Loading...'}
            </Text>
            <Text
              style={styles.lastMessage}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.lastMessage || 'No messages yet.'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!currentUser || chats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateWrapper}>
          <Text style={styles.infoText}>
            {currentUser
              ? 'No chats yet. Start a conversation!'
              : 'Please log in or create an account to use the chat feature.'}
          </Text>
          <Image
            source={require('../../../assets/mySpaces/chats.png')}
            style={styles.awaitingImage}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFCF1',
  },
  chatItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ddd',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  infoText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  awaitingImage: {
    width: width,
    height: height * 0.5,
    opacity: 0.9,
  },
});
