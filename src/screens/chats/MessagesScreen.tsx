



import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  serverTimestamp,
  getDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  MessagesScreen: { chatId: string; otherUser: string };
};

type MessagesScreenRouteProp = RouteProp<RootStackParamList, 'MessagesScreen'>;

interface Props {
  route: MessagesScreenRouteProp;
}

// interface Message {
//   id: string;
//   text: string;
//   senderId: string;
//   createdAt: any;
// }

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  isReference?: boolean;
  referenceData?: {
    title: string;
    image?: string;
    spaceId?: string;
  };
}


export default function MessagesScreen({ route }: Props) {
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherUserData, setOtherUserData] = useState<any | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgData: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, 'id'>),
      }));
      setMessages(msgData);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    const fetchOtherUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUser));
        if (userDoc.exists()) {
          setOtherUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching other user data:', error);
      }
    };

    fetchOtherUserData();
  }, [otherUser]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: input,
      senderId: auth.currentUser?.uid ?? 'unknown',
      createdAt: serverTimestamp(),
    });

    setInput('');
  };



  const renderItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === auth.currentUser?.uid;
    const formattedTime = item.createdAt?.toDate
      ? new Date(item.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';


      if (item.isReference && item.referenceData) {
        return (
          <View style={styles.referenceContainer}>
            {item.referenceData.image && (
              <Image
                source={{ uri: item.referenceData.image }}
                style={styles.referenceImage}
              />
            )}
            <Text style={styles.referenceTitle}>
              Responding to: {item.referenceData.title}
            </Text>
          </View>
        );
      }
      


    if (isCurrentUser) {
      return (
        <View style={styles.sentContainer}>
          <View style={styles.bubble}>
            <Text style={styles.sent}>{item.text}</Text>
            <Text style={styles.timestamp}>{formattedTime}</Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.receivedContainer}>
          <Image
            source={
              otherUserData?.profileImage
                ? { uri: otherUserData.profileImage }
                : require('../../../assets/blankProfile.png')
            }
            style={styles.avatar}
          />
          <View style={styles.bubble}>
            <Text style={styles.received}>{item.text}</Text>
            <Text style={styles.timestamp}>{formattedTime}</Text>
          </View>
        </View>
      );
    }
  };




  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },

  // Sent message
  sentContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginVertical: 6,
    maxWidth: '75%',
  },
  sent: {
    backgroundColor: '#007AFF',
    color: '#fff',
    padding: 8,
    borderRadius: 6,
  },

  // Received message
  receivedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    maxWidth: '75%',
  },
  received: {
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 6,
  },

  // Common
  bubble: {
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginTop: 4,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  sendText: {
    color: 'white',
    fontWeight: '500',
  },
  referenceContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    maxWidth: '75%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  referenceImage: {
    width: 200,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  referenceTitle: {
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  
});
