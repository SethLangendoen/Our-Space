


import { COLORS, FONT_SIZES, SPACING, COMMON_STYLES } from '../Styles/theme';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatsStackParamList } from 'src/navigation/stacks/ChatsStack';
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
  lastRead?: {
    [userId: string]: any;
  };
  unreadCount?: {
    [userId: string]: number;
  };
}

interface User {
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

type ChatsScreenNavigationProp = NativeStackNavigationProp<
  ChatsStackParamList,
  'ChatsMain'
>;



export default function ChatsScreen() {
  // const navigation = useNavigation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userDataMap, setUserDataMap] = useState<{ [key: string]: User }>({});
  const navigation = useNavigation<ChatsScreenNavigationProp>();

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
    const me = currentUser;

    const lastReadTime = item.lastRead?.[me!]?.toMillis?.() ?? 0;
    const updatedTime =
      item.updatedAt?.toMillis?.() ??
      item.updatedAt?.seconds * 1000 ??
      0;

    const unreadCount = item.unreadCount?.[me!] ?? 0;

    return (
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() =>
            navigation.navigate('MessagesScreen', {
              chatId: item.id,
              otherUser: otherUserId,
            })
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

            <View style={styles.unreadCounts}>
            <Text
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.unreadMessage
              ]}
            >
              {item.lastMessage || 'No messages yet.'}
            </Text>

            </View>

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
    backgroundColor: COLORS.lighterGrey,
    
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
    width: '100%', // Fit inside the container
    maxHeight: height * 0.4, // Make it slightly smaller
    aspectRatio: 1.5, // optional, keep the image proportioned
    opacity: 0.9,
  },
  unreadDot: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  unreadText: {
    color: '#F3AF1D',
    fontSize: 18,
    fontWeight: '900',
  },

  
  unreadMessage: {
    fontWeight: '700',
    color: '#0F6B5B',
  },
  unreadCounts: {
    display: 'flex',
    flexDirection: 'row'
  }
});
