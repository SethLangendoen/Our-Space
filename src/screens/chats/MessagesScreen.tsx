


import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
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
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../Styles/theme';

type RootStackParamList = {
  MessagesScreen: { chatId: string; otherUser: string };
};

type MessagesScreenRouteProp = RouteProp<RootStackParamList, 'MessagesScreen'>;

interface Props {
  route: MessagesScreenRouteProp;
}

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
    reservationId?: string;
  };
}

export default function MessagesScreen({ route }: Props) {
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherUserData, setOtherUserData] = useState<any | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);


  // Fetch messages
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

  // Fetch other user data
  useEffect(() => {
    const fetchOtherUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUser));
        if (userDoc.exists()) setOtherUserData(userDoc.data());
      } catch (err) {
        console.error(err);
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
  
    // Blur the input to remove focus
    inputRef.current?.blur();
  
    // Just in case, dismiss keyboard
    Keyboard.dismiss();
  };
  

  const renderItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === auth.currentUser?.uid;
    const formattedTime = item.createdAt?.toDate
      ? new Date(item.createdAt.toDate()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';



    // Reference / Reservation messages
    if (item.isReference && item.referenceData) {
      const isReservation = !!item.referenceData.reservationId;




      return (

        <View
        style={[
          styles.receivedContainer,
          isCurrentUser && styles.sentContainer,
        ]}
      >
        {!isCurrentUser && (
          <Image
            source={
              otherUserData?.profileImage
                ? { uri: otherUserData.profileImage }
                : require('../../../assets/blankProfile.png')
            }
            style={styles.avatar}
          />
        )}
        <TouchableOpacity
          onPress={() => {
            if (isReservation) {
              navigation.navigate('MySpaces', {
                screen: 'RequestDetailScreen',
                params: { reservationId: item.referenceData?.reservationId },
              });
            } else if (item.referenceData?.spaceId) {
              navigation.navigate('Spaces', {
                screen: 'SpaceDetail',
                params: { spaceId: item.referenceData?.spaceId },
              });
            }
          }}
          style={[
            styles.bubble,
            isCurrentUser ? styles.sentBubble : styles.receivedBubble,
          ]}
        >
          {item.referenceData.image && (
            <Image
              source={{ uri: item.referenceData.image }}
              style={styles.referenceImage}
            />
          )}
          <Text
            style={[
              styles.referenceTitle,
              isReservation && styles.reservationTitle,
            ]}
          >
            {isReservation
              ? `Requested: ${item.referenceData.title}`
              : `Responding to: ${item.referenceData.title}`}
          </Text>
        </TouchableOpacity>
      </View>



        // <TouchableOpacity
        //   onPress={() => {
        //     if (isReservation) {
        //       navigation.navigate('MySpaces', {
        //         screen: 'RequestDetailScreen',
        //         params: { reservationId: item.referenceData?.reservationId },
        //       });
        //     } else if (item.referenceData?.spaceId) {
        //       navigation.navigate('Spaces', {
        //         screen: 'SpaceDetail',
        //         params: { spaceId: item.referenceData?.spaceId },
        //       });
        //     }
        //   }}
        //   style={[
        //     styles.referenceContainer,
        //     isReservation && styles.reservationContainer,
        //   ]}
        // >
        //   {item.referenceData.image && (
        //     <Image
        //       source={{ uri: item.referenceData.image }}
        //       style={styles.referenceImage}
        //     />
        //   )}
        //   <Text
        //     style={[
        //       styles.referenceTitle,
        //       isReservation && styles.reservationTitle,
        //     ]}
        //   >
        //     {isReservation
        //       ? `Requested: ${item.referenceData.title}`
        //       : `Responding to: ${item.referenceData.title}`}
        //   </Text>
        // </TouchableOpacity>




      );
    }









    
    // Normal messages
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
        <View style={styles.container}>



            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 10 }}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              keyboardShouldPersistTaps="handled" // allows taps to go through when keyboard is open
              keyboardDismissMode="on-drag"       // dismiss keyboard when user drags
              showsVerticalScrollIndicator={false}
            />



          <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
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
      {/* </TouchableWithoutFeedback> */}
    </KeyboardAvoidingView>

    
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.lighterGrey,
  },

  // Sent message
  sentContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginVertical: 6,
    maxWidth: '75%',
  },
  sent: {
    backgroundColor: '#0F6B5B', // emerald green
    color: '#fff',
    padding: 10,
    borderRadius: 12,
    fontFamily: 'Poppins',
    fontWeight: '500', // medium weight for body
  },

  // Received message
  receivedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    maxWidth: '75%',
  },
  received: {
    backgroundColor: '#629447', // earthy green
    color: '#fff',
    padding: 10,
    borderRadius: 12,
    fontFamily: 'Poppins',
    fontWeight: '400', // regular for received messages
  },

  // Common
  bubble: {
    flexShrink: 1,
  },
  timestamp: {
    fontSize: 10,
    color: '#F3AF1D', // mustard yellow for timestamps
    marginTop: 2,
    alignSelf: 'flex-end',
    fontFamily: 'Poppins',
    fontWeight: '400',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0', // subtle divider
    paddingTop: 8,
    backgroundColor: COLORS.lighterGrey,
  },
  input: {
    flex: 1,
    borderColor: '#0F6B5B',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontFamily: 'Poppins',
    fontWeight: '400',
    backgroundColor: '#fff',
    color: '#0F6B5B',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#F3AF1D', // mustard yellow
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendText: {
    color: '#0F6B5B', // emerald green text on mustard button
    fontWeight: '700', // bold CTA
    fontFamily: 'Poppins',
  },

  referenceContainer: {
    backgroundColor: '#FFFCF1',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    maxWidth: '75%',
    alignSelf: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#629447', // earthy green outline
  },
  referenceImage: {
    width: 200,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  referenceTitle: {
    fontWeight: '600',
    color: '#FFFFFF', // emerald green
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  reservationContainer: {
    backgroundColor: '#F3AF1D', // mustard yellow
    borderWidth: 1,
    borderColor: '#0F6B5B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    maxWidth: '75%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  reservationTitle: {
    fontWeight: '700',
    color: '#FFFFFF', // emerald green text
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  sentBubble: {
    backgroundColor: '#0F6B5B',
    borderRadius: 12,
    padding: 10,
    maxWidth: '75%',
  },
  receivedBubble: {
    backgroundColor: '#629447',
    borderRadius: 12,
    padding: 10,
    maxWidth: '75%',
  },
  
});
