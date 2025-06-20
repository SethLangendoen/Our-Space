


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native'; // 👈 Add this

import { Ionicons } from '@expo/vector-icons'; // 👈 or any other icon library
import { useLayoutEffect } from 'react';

const { width } = Dimensions.get('window');

type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;

};

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ProfileMain'
>;




export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'Listings' | 'Reviews' | 'Badges'>('Listings');
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const badgeList = [
    {
      id: 'beginner',
      title: 'Beginner Badge',
      // icon: require('../../../assets/badges/beginner.png'),
      description: 'Complete your profile and add your first listing.',
    },
    {
      id: 'trusted',
      title: 'Trusted Host',
      // icon: require('../../../assets/badges/trusted.png'),
      description: 'Receive at least 3 positive reviews from guests.',
    },
    {
      id: 'superhost',
      title: 'Superhost',
      // icon: require('../../../assets/badges/superhost.png'),
      description: 'Host consistently for 6+ months with great ratings.',
    },
    {
      id: 'responsive',
      title: 'Responsive Communicator',
      // icon: require('../../../assets/badges/responsive.png'),
      description: 'Respond to 90% of messages within 24 hours.',
    },
    {
      id: 'community',
      title: 'Community Star',
      // icon: require('../../../assets/badges/community.png'),
      description: 'Participate in community discussions and events.',
    },
  ];
  
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const isFocused = useIsFocused(); // 👈 Detect screen focus


  // const fetchUserData = async () => {
  //   const user = auth.currentUser;
  //   if (!user) return;

  //   setLoading(true); // Optional: show loading spinner on re-focus

  //   try {
  //     const userRef = doc(db, 'users', user.uid);
  //     const userSnap = await getDoc(userRef);

  //     if (userSnap.exists()) {
  //       const data = userSnap.data();
  //       const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  //       setName(fullName || 'No Name');
  //       setBio(data.bio || '');
  //     } else {
  //       setName(user.email || '');
  //       setBio('');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching profile:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    setLoading(true);
  
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const data = userSnap.data();
        const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
        setName(fullName || 'No Name');
        setBio(data.bio || '');
        setProfileImage(data.profileImage || null);  // <-- load profile image URL here
      } else {
        setName(user.email || '');
        setBio('');
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  




  // Initial fetch on first mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Refetch on focus (e.g. after editing profile)
  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  return (
    <View style={styles.container}>

      {/* <View style={styles.headerBackground} /> */}

      <View style={styles.headerSection}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10</Text>
            <Text style={styles.statLabel}>Space Badges</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </View>



      <View style={styles.profileContainer}>
      <Image
          source={profileImage ? { uri: profileImage } : require('../../../assets/blankProfile.png')}
          style={styles.profileImage}
        />


        {/* <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>10</Text>
            <Text style={styles.statLabel}>Space Badges</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View> */}

        <Text style={styles.name}>{name}</Text>

        <Text style={styles.aboutText}>
          {bio || 'No bio provided yet.'}
        </Text>


        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.tabContainer}>
          {['Listings', 'Reviews', 'Badges'].map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab as any)} style={styles.tab}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.activeUnderline} />}
            </Pressable>
          ))}
        </View>

        <View style={styles.tabContent}>
          <Text>{activeTab} content goes here</Text>
        </View>


        {activeTab === 'Badges' && (
          <View style={styles.badgeList}>
            {badgeList.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={styles.badgeItem}
                onPress={() => Alert.alert(badge.title, badge.description)}
              >
                {/* <Image source={badge.icon} style={styles.badgeIcon} /> */}
                <Text style={styles.badgeTitle}>{badge.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        


      </View>
    </View>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    height: 100,
    backgroundColor: '#E3A72F',
    justifyContent: 'center',
    position: 'relative',
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    position: 'absolute',
    width: '100%',
    top: 30, // adjust as needed to vertically center with profile image
  },
  
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#444',
  },
  
  profileContainer: {
    alignItems: 'center',
    marginTop: -60,
    paddingHorizontal: 20,
  },
  
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#ccc',
  },
  
  // statsRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   width: '60%',
  //   marginTop: 16,
  // },
  // statBox: {
  //   alignItems: 'center',
  // },
  // statNumber: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  // },
  // statLabel: {
  //   fontSize: 12,
  //   color: '#666',
  // },

  name: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    marginVertical: 15,
    gap: 10,
    width: '100%',          // make sure container is full width
    paddingHorizontal: 10,  // optional, to align with profile container padding
  },
  
  button: {
    backgroundColor: '#000',
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,                // take equal space
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    marginBottom: 12,
  },
  tab: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  activeUnderline: {
    height: 2,
    backgroundColor: '#000',
    width: 24,
    marginTop: 4,
    borderRadius: 1,
  },
  tabContent: {
    alignItems: 'center',
    padding: 20,
  },
  badgeList: {
    width: '100%',
    paddingHorizontal: 20,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  badgeIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
    resizeMode: 'contain',
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  
});
